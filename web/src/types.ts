export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "complete" | "generating" | "failed" | "cancelled";
  provider?: "mock" | "gemini";
  position: number;
  createdAt: string;
};
export type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages?: Message[];
};
