import { z } from "zod";

export const MAX_CHAT_MESSAGES = 40;

export const chatInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1, "Please type a message first.").max(8000, "That message is too long (max 8,000 characters)."),
      }),
    )
    .min(1)
    .max(MAX_CHAT_MESSAGES, "This conversation is getting long. Start a new conversation to continue."),
});
export type ChatRequest = z.infer<typeof chatInputSchema>;
export type ChatMessage = ChatRequest["messages"][number];
export type ChatResponse = { ok: true; reply: string } | { ok: false; error: string };
