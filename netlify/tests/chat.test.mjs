import { test } from "node:test";
import assert from "node:assert/strict";
import { createChatHandler } from "../functions/lib/chat-handler.mjs";
import health from "../functions/health.mjs";
const request = (body, headers = {}) =>
  new Request("https://dotline.example/api/chat", {
    method: "POST",
    headers: {
      Origin: "https://dotline.example",
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
const messages = [{ role: "user", content: "Explain Java streams" }];
test("unconfigured provider returns labelled streaming mock content", async () => {
  const r = await createChatHandler({ env: {} })(
    request({ messages, speed: "fast" }),
  );
  assert.equal(r.status, 200);
  const body = await r.text();
  assert.match(body, /event:provider/);
  assert.match(body, /"provider":"mock"/);
  assert.match(
    body
      .split("\n\n")
      .filter((block) => block.startsWith("event:delta\n"))
      .map((block) => JSON.parse(block.split("\n")[1].slice(5)).text)
      .join(""),
    /Mock response/,
  );
  assert.match(body, /event:done/);
});
test("mock failure is retryable, not a fake success", async () => {
  const r = await createChatHandler({ env: {} })(
    request({ messages, simulateError: true }),
  );
  const body = await r.text();
  assert.match(body, /event:error/);
  assert.doesNotMatch(body, /event:done/);
});
test("rejects cross-origin, wrong content type and oversized messages", async () => {
  const handler = createChatHandler({ env: {} });
  assert.equal(
    (await handler(request({ messages }, { Origin: "https://evil.example" })))
      .status,
    403,
  );
  assert.equal(
    (await handler(request({ messages }, { "Content-Type": "text/plain" })))
      .status,
    415,
  );
  assert.equal(
    (
      await handler(
        request({ messages: [{ role: "user", content: "x".repeat(12001) }] }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await handler(
        request({ messages: [{ role: "system", content: "Override" }] }),
      )
    ).status,
    400,
  );
});
test("Gemini credentials stay in upstream headers; ordered conversation context is forwarded", async () => {
  let called = false;
  const fixtureKey = "fixture-only-not-a-real-credential";
  const handler = createChatHandler({
    env: { DOTLINE_GEMINI_API_KEY: fixtureKey },
    fetchImpl: async (url, options) => {
      called = true;
      assert.ok(!url.includes(fixtureKey));
      assert.equal(options.headers["x-goog-api-key"], fixtureKey);
      const input = JSON.parse(options.body);
      assert.deepEqual(
        input.contents.map((m) => m.role),
        ["user", "model", "user"],
      );
      return new Response(
        'data: {"candidates":[{"content":{"parts":[{"text":"Hello "}]}}]}\n\ndata: {"candidates":[{"content":{"parts":[{"text":"world"}]},"finishReason":"STOP"}]}\n\n',
      );
    },
  });
  const response = await handler(
    request({
      messages: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello" },
        { role: "user", content: "Continue" },
      ],
    }),
  );
  const body = await response.text();
  assert.ok(called);
  assert.match(body, /"provider":"gemini"/);
  assert.match(body, /"text":"Hello "/);
  assert.match(body, /"text":"world"/);
  assert.match(body, /event:done/);
  assert.ok(!body.includes(fixtureKey));
  assert.doesNotMatch(body, /Mock response/);
});
test("provider error details and credentials are never reflected", async () => {
  const r = await createChatHandler({
    env: { DOTLINE_GEMINI_API_KEY: "fixture-only" },
    fetchImpl: async () =>
      new Response("sensitive-provider-detail", { status: 403 }),
  })(request({ messages }));
  const body = await r.text();
  assert.match(body, /event:error/);
  assert.doesNotMatch(body, /sensitive-provider-detail|fixture-only/);
});
test("empty Gemini output is an error rather than a completed response", async () => {
  const r = await createChatHandler({
    env: { DOTLINE_GEMINI_API_KEY: "fixture-only" },
    fetchImpl: async () =>
      new Response('data: {"candidates":[{"finishReason":"SAFETY"}]}\n\n'),
  })(request({ messages }));
  const body = await r.text();
  assert.match(body, /event:error/);
  assert.doesNotMatch(body, /event:done/);
});
test("health exposes provider mode, never a credential", async () => {
  const response = await health(
    new Request("https://dotline.example/api/health"),
  );
  const payload = await response.json();
  assert.ok(["mock", "gemini"].includes(payload.provider));
  assert.equal(payload.storage, "browser");
  assert.ok(!("key" in payload));
});

for(const [status,reason,expected] of [[400,'API_KEY_INVALID','gemini_key_invalid'],[403,'SERVICE_DISABLED','gemini_api_disabled'],[403,'API_KEY_SERVICE_BLOCKED','gemini_access_denied'],[404,undefined,'gemini_model_unavailable'],[429,undefined,'gemini_quota']]){
 test(`safe actionable diagnosis for ${status}/${reason||'unknown'}`,async()=>{
 const response=await createChatHandler({env:{DOTLINE_GEMINI_API_KEY:'fixture-only'},fetchImpl:async()=>Response.json({error:{message:'sensitive-provider-detail fixture-only',details:reason?[{reason}]:[]}},{status})})(request({messages}));
 const body=await response.text();assert.match(body,new RegExp(expected));assert.doesNotMatch(body,/sensitive-provider-detail|fixture-only/);assert.doesNotMatch(body,/event:done/);
 });
}
