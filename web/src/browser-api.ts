import type { Conversation, Message } from "./types";
import { SseParser, type StreamEvent } from "./sse";
const KEY = "dotline.browser-conversations.v1";
const active = new Map<string, AbortController>();
function all(): Conversation[] {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    throw Error(
      "Could not read browser history. Check storage permissions for this website.",
    );
  }
}
function save(chats: Conversation[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(chats));
  } catch {
    throw Error(
      "Browser storage is full or unavailable. Delete an old conversation or enable website storage.",
    );
  }
}
function get(id: string) {
  const chat = all().find((c) => c.id === id);
  if (!chat) throw Error("This conversation no longer exists in this browser.");
  return chat;
}
function update(chat: Conversation) {
  const chats = all();
  const i = chats.findIndex((c) => c.id === chat.id);
  if (i < 0) throw Error("This conversation was deleted in another tab.");
  chat.updatedAt = new Date().toISOString();
  chats[i] = chat;
  save(chats);
}
function unlocked(id: string) {
  if (active.has(id))
    throw Error("Stop the active response before changing this conversation.");
}
export const browserApi = {
  async health(): Promise<{ provider: "mock" | "gemini" }> {
    const r = await fetch("/api/health", { cache: "no-store" });
    if (!r.ok) throw Error("The chat service is not available yet.");
    return r.json();
  },
  async list() {
    return all()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(({ messages, ...c }) => c);
  },
  async get(id: string) {
    return get(id);
  },
  async create() {
    const chats = all();
    if (chats.length >= 100)
      throw Error(
        "This browser has 100 conversations. Delete an old one to make space.",
      );
    const chat: Conversation = {
      id: crypto.randomUUID(),
      title: "Untitled conversation",
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    save([chat, ...chats]);
    return chat;
  },
  async rename(id: string, title: string) {
    unlocked(id);
    if (!title.trim() || title.trim().length > 80)
      throw Error("Use a conversation name between 1 and 80 characters.");
    const chat = get(id);
    chat.title = title.trim();
    update(chat);
    return chat;
  },
  async remove(id: string) {
    unlocked(id);
    save(all().filter((c) => c.id !== id));
  },
  async cancel(id: string) {
    active.get(id)?.abort();
  },
};
export async function streamBrowser(
  id: string,
  input: object,
  signal: AbortSignal,
  onEvent: (event: StreamEvent) => void,
) {
  unlocked(id);
  let chat = get(id);
  const request = input as {
    content?: string;
    regenerate?: boolean;
    editMessageId?: string;
    simulateError?: boolean;
    speed?: string;
  };
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) controller.abort();
  active.set(id, controller);
  let assistant: Message | undefined;
  try {
    let history = chat.messages || [];
    let user: Message;
    if (request.regenerate) {
      if (history.at(-1)?.role === "assistant") history = history.slice(0, -1);
      if (history.at(-1)?.role !== "user")
        throw Error("Send a message before regenerating.");
      user = history.at(-1)!;
    } else {
      const content = request.content?.trim();
      if (!content || content.length > 12000)
        throw Error("Write a message of up to 12,000 characters.");
      if (request.editMessageId) {
        const index = history.findIndex(
          (m) => m.id === request.editMessageId && m.role === "user",
        );
        if (index < 0) throw Error("This message no longer exists.");
        history = history.slice(0, index);
      }
      user = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        status: "complete",
        position: history.length,
        createdAt: new Date().toISOString(),
      };
      history = [...history, user];
    }
    if (history.length > 200)
      throw Error(
        "This conversation is full. Please start a new conversation.",
      );
    assistant = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      status: "generating",
      position: history.length,
      createdAt: new Date().toISOString(),
      provider: "mock",
    };
    chat = {
      ...chat,
      title:
        chat.title === "Untitled conversation"
          ? user.content.replace(/\s+/g, " ").slice(0, 45)
          : chat.title,
      messages: [...history, assistant],
    };
    update(chat);
    onEvent({ event: "message", data: user });
    onEvent({ event: "message", data: { ...assistant } });
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: selectContext(history),
        simulateError: request.simulateError,
        speed: request.speed,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const problem = await response
        .json()
        .catch(() => ({
          message: "The AI service is temporarily unavailable.",
        }));
      throw Error(problem.message || "Could not generate a response.");
    }
    if (!response.body) throw Error("Streaming is unavailable.");
    const reader = response.body.getReader(),
      decoder = new TextDecoder(),
      parser = new SseParser();
    let completed = false;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const event of parser.push(
          decoder.decode(value, { stream: true }),
        )) {
          if (event.event === "provider") {
            assistant.provider = event.data.provider;
            onEvent({ event: "message", data: { ...assistant } });
          } else if (event.event === "delta") {
            assistant.content += event.data.text;
            update(chat);
            onEvent(event);
          } else if (event.event === "done") completed = true;
          else if (event.event === "error") throw Error(event.data.message);
        }
      }
      if (!completed)
        throw Error("The response was interrupted. Regenerate to retry.");
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
    assistant.status = controller.signal.aborted ? "cancelled" : "complete";
    update(chat);
    onEvent({ event: "done", data: { ...assistant } });
  } catch (error) {
    if (assistant) {
      assistant.status = controller.signal.aborted ? "cancelled" : "failed";
      update(chat);
    }
    throw error;
  } finally {
    signal.removeEventListener("abort", abort);
    active.delete(id);
  }
}

function selectContext(history: Message[]) {
  const selected: { role: string; content: string }[] = [];
  let size = 0;
  for (const m of [...history].reverse()) {
    if (!m.content.trim()) continue;
    if (selected.length >= 40 || size + m.content.length > 60000) break;
    selected.push({ role: m.role, content: m.content });
    size += m.content.length;
  }
  selected.reverse();
  while (selected[0]?.role === "assistant") selected.shift();
  return selected;
}
