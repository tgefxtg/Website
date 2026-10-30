import type { Conversation } from "./types";
export type { Message, Conversation } from "./types";
import { browserApi, streamBrowser } from "./browser-api";
import { SseParser } from "./sse";
export { SseParser } from "./sse";
export type { StreamEvent } from "./sse";
import type { StreamEvent } from "./sse";
export const usesBrowserStorage =
  import.meta.env.VITE_CHAT_STORAGE === "browser";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const r = await fetch("/api" + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!r.ok) {
    const e = await r
      .json()
      .catch(() => ({ message: "Server unavailable. Try again." }));
    throw new ApiError(r.status, e.message || "Something went wrong.");
  }
  return r.status === 204 ? (undefined as T) : r.json();
}
const serverApi = {
  health: () => request<{ provider: "mock" | "gemini" }>("/health"),
  list: () => request<Conversation[]>("/conversations"),
  get: (id: string) => request<Conversation>("/conversations/" + id),
  create: () =>
    request<Conversation>("/conversations", { method: "POST", body: "{}" }),
  rename: (id: string, title: string) =>
    request<Conversation>("/conversations/" + id, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),
  remove: (id: string) =>
    request<void>("/conversations/" + id, { method: "DELETE" }),
  cancel: (id: string) =>
    request<void>("/conversations/" + id + "/cancel", { method: "POST" }),
};
export const api = usesBrowserStorage ? browserApi : serverApi;
export async function stream(
  id: string,
  input: object,
  signal: AbortSignal,
  onEvent: (event: StreamEvent) => void,
) {
  if (usesBrowserStorage) return streamBrowser(id, input, signal, onEvent);
  const r = await fetch(`/api/conversations/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  if (!r.ok) {
    const data = await r
      .json()
      .catch(() => ({ message: "Could not connect." }));
    throw new ApiError(r.status, data.message);
  }
  if (!r.body) throw Error("Streaming is unavailable.");
  const reader = r.body.getReader(),
    decoder = new TextDecoder(),
    parser = new SseParser();
  let doneEvent = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const event of parser.push(
        decoder.decode(value, { stream: true }),
      )) {
        if (event.event === "done") doneEvent = true;
        if (event.event === "error") throw Error(event.data.message);
        onEvent(event);
      }
    }
    if (!doneEvent) throw Error("The response was interrupted. Please retry.");
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
