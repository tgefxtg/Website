import { createChatHandler } from "./lib/chat-handler.mjs";
export default createChatHandler();
// Netlify enforces this limit across function instances, before provider calls.
export const config = {
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
