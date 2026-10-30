const json = (status, message, code = "invalid_request") =>
  Response.json(
    { code, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
const event = (name, data) =>
  new TextEncoder().encode(`event:${name}\ndata:${JSON.stringify(data)}\n\n`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Only fixed, whitelisted diagnostics are returned; never reflect Google payloads.
class GeminiError extends Error {
  constructor(code,message){super(message);this.code=code;}
}
async function providerError(response){
  let reason;
  try{const payload=await response.json();reason=payload.error?.details?.find(d=>typeof d.reason==='string')?.reason;}catch{}
  if(['API_KEY_INVALID','API_KEY_EXPIRED','CONSUMER_INVALID'].includes(reason)||response.status===401)return new GeminiError('gemini_key_invalid','Google rejected the Gemini API key. Replace DOTLINE_GEMINI_API_KEY in Netlify Functions settings and redeploy.');
  if(reason==='SERVICE_DISABLED')return new GeminiError('gemini_api_disabled','The Generative Language API is disabled for this Google project. Enable it in Google Cloud, then retry.');
  if(response.status===403)return new GeminiError('gemini_access_denied','Google denied Gemini access (403). Check the API key restrictions and whether its Google project has access to the Generative Language API.');
  if(response.status===404)return new GeminiError('gemini_model_unavailable','The configured Gemini model is unavailable (404). Set DOTLINE_GEMINI_MODEL to a model supported by your Google AI Studio account, then redeploy.');
  if(response.status===429)return new GeminiError('gemini_quota','Google reports a Gemini quota or rate limit (429). Check the Google project usage limits and billing, then retry.');
  if(response.status===400)return new GeminiError('gemini_request_rejected','Google rejected the Gemini request (400). Check the Gemini API key, configured model and Google project settings.');
  return new GeminiError('gemini_unavailable','Gemini is temporarily unavailable. Please retry shortly.');
}

async function boundedJson(request) {
  const reader = request.body?.getReader();
  if (!reader) throw Error("empty");
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 100000) throw Error("large");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
function validate(body) {
  if (
    !Array.isArray(body.messages) ||
    !body.messages.length ||
    body.messages.length > 40
  )
    throw Error("messages");
  let total = 0;
  for (const m of body.messages) {
    if (
      !m ||
      !["user", "assistant"].includes(m.role) ||
      typeof m.content !== "string" ||
      !m.content.trim() ||
      m.content.length > 12000
    )
      throw Error("message");
    total += m.content.length;
  }
  if (total > 60000 || body.messages.at(-1).role !== "user")
    throw Error("context");
  return body;
}
function mockAnswer(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes("java") || lower.includes("code"))
    return '**A small idea, made concrete.**\n\nJava streams transform a collection without changing the original.\n\n```java\nList<String> ideas = List.of("Make space", "Stay curious", "Begin small");\nList<String> shortIdeas = ideas.stream()\n    .filter(idea -> idea.length() < 12)\n    .map(String::toUpperCase)\n    .toList();\n```\n\n1. **Filter** keeps the ideas you want.\n2. **Map** transforms each one.\n3. **Collect** creates a new list.\n\n> Mock response — a deterministic example, not live AI output.';
  if (lower.includes("plan") || lower.includes("week"))
    return "## Make room for what matters.\n\nA good plan leaves a little space around the edges.\n\n- **Monday · Find the signal.** Choose one useful outcome.\n- **Tuesday–Thursday · Go deeper.** Protect a focused work block each day.\n- **Friday · Connect the dots.** Review what moved forward.\n\nLeave a little room for an unexpected idea.\n\n> Mock response — a deterministic planning example, not live AI output.";
  return "## Follow the interesting thread.\n\n**01 / Start with the friction.** What everyday moment feels more complicated than it needs to?\n\n**02 / Make the smallest useful thing.** Sketch one interaction that makes that moment easier.\n\n**03 / Put it in someone’s hands.** Learn from a real conversation.\n\nWhat would you like to explore first?\n\n> Mock response — a deterministic example, not live AI output.";
}

async function googleStream(response, onText, signal) {
  if (!response.body) throw Error("empty");
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let buffer = "",
    seenText = false;
  try {
    while (true) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      const { value, done } = await reader.read();
      if (done) break;
      buffer = (buffer + decoder.decode(value, { stream: true })).replace(
        /\r\n/g,
        "\n",
      );
      if (buffer.length > 1000000) throw Error("oversize");
      let boundary;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = block
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");
        if (!data) continue;
        const payload = JSON.parse(data);
        if (payload.error) throw new GeminiError("gemini_stream_error","Gemini interrupted its response. Please retry.");
        const candidate = payload.candidates?.[0];
        const text = candidate?.content?.parts
          ?.map((part) => part.text || "")
          .join("");
        if (text) {
          seenText = true;
          onText(text);
        }
        if (
          ["SAFETY", "RECITATION", "PROHIBITED_CONTENT"].includes(
            candidate?.finishReason,
          )
        )
          throw new GeminiError("gemini_blocked","Gemini declined this request. Try rephrasing your message.");
      }
    }
    if (!seenText) throw new GeminiError("gemini_empty","Gemini returned no visible text. Try a shorter question or check the configured model.");
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function createChatHandler({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  return async (request) => {
    if (request.method !== "POST")
      return json(405, "Use POST for chat.", "method_not_allowed");
    const origin = request.headers.get("Origin");
    if (!origin || origin !== new URL(request.url).origin)
      return json(
        403,
        "This request origin is not allowed.",
        "origin_rejected",
      );
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return json(415, "Send a JSON request.");
    let body;
    try {
      body = validate(await boundedJson(request));
    } catch {
      return json(
        400,
        "Send up to 40 non-empty messages, 12,000 characters per message and 60,000 characters total.",
        "invalid_input",
      );
    }
    const key = env.DOTLINE_GEMINI_API_KEY?.trim();
    const provider = key ? "gemini" : "mock";
    const model = env.DOTLINE_GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    if (!/^gemini-[a-z0-9.-]{1,80}$/.test(model))
      return json(
        503,
        "The site owner needs to configure a valid Gemini model.",
        "configuration_error",
      );
    const cancel = new AbortController();
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 55000);
    const signal = AbortSignal.any([
      request.signal,
      cancel.signal,
      timeout.signal,
    ]);
    let closed = false;
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (name, data) => {
          if (!closed) controller.enqueue(event(name, data));
        };
        try {
          emit("provider", { provider });
          if (!key) {
            if (body.simulateError) throw Error("simulated");
            const text = mockAnswer(body.messages.at(-1).content);
            await sleep(body.speed === "fast" ? 1 : 300);
            for (const token of text.split(/(?<=\s)/)) {
              if (signal.aborted)
                throw new DOMException("Cancelled", "AbortError");
              emit("delta", { text: token });
              await sleep(body.speed === "fast" ? 1 : 18);
            }
          } else {
            const contents = body.messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            }));
            const response = await fetchImpl(
              `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-goog-api-key": key,
                },
                body: JSON.stringify({
                  contents,
                  systemInstruction: {
                    parts: [
                      {
                        text: "You are DOTLINE, a thoughtful, concise assistant. Use readable Markdown and clearly explain uncertainty. Never claim you have taken external actions or verified sources when you have not.",
                      },
                    ],
                  },
                  generationConfig: { maxOutputTokens: 2048, ...(model.startsWith("gemini-2.5-flash")?{thinkingConfig:{thinkingBudget:0}}:{}) },
                }),
                signal,
              },
            );
            if (!response.ok) throw await providerError(response);
            let size = 0;
            await googleStream(
              response,
              (text) => {
                size += text.length;
                if (size > 100000) throw Error("oversize");
                emit("delta", { text });
              },
              signal,
            );
          }
          emit("done", { provider });
        } catch (error) {
          if (!cancel.signal.aborted && !request.signal.aborted)
            emit("error", {
              code: provider === "mock" ? "mock_failure" : error instanceof GeminiError ? error.code : "provider_error",
              message:
                provider === "mock" && body.simulateError
                  ? "Simulated provider failure. Your message is saved. Retry to generate a response."
                  : timeout.signal.aborted
                    ? "The AI service timed out. Please retry."
                    : error instanceof GeminiError
                      ? error.message
                      : "The AI service could not complete this response. Please retry or ask the site owner to check the server configuration.",
            });
        } finally {
          clearTimeout(timer);
          if (!closed) {
            closed = true;
            controller.close();
          }
        }
      },
      cancel() {
        closed = true;
        clearTimeout(timer);
        cancel.abort();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-store",
        "X-Accel-Buffering": "no",
        "X-Content-Type-Options": "nosniff",
      },
    });
  };
}
