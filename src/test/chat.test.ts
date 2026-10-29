import { describe, it, expect } from "vitest";
import { chatInputSchema, MAX_CHAT_MESSAGES } from "@/lib/ai/chat.schema";

describe("chat input", () => {
  it("rejects an empty or whitespace-only message", () => {
    expect(chatInputSchema.safeParse({ messages: [{ role: "user", content: "   " }] }).success).toBe(false);
  });
  it("accepts a multi-turn conversation", () => {
    expect(chatInputSchema.safeParse({ messages: [
      { role: "user", content: "Hi" }, { role: "assistant", content: "Hello" }, { role: "user", content: "Help me" },
    ] }).success).toBe(true);
  });
  it("rejects conversations longer than the limit", () => {
    const messages = Array.from({ length: MAX_CHAT_MESSAGES + 1 }, () => ({ role: "user" as const, content: "x" }));
    expect(chatInputSchema.safeParse({ messages }).success).toBe(false);
  });
});
