import { createOpenAI } from "@ai-sdk/openai";
import { streamText, APICallError } from "ai";
import type { ChatRequest, ChatResponse } from "./chat.schema";

const INSTRUCTIONS = `You are Workday Copilot, a helpful workplace assistant. Answer clearly and concisely.
Rules:
- You have NO web access and cannot browse, search or open links. Never claim to have done so.
- Never invent facts, figures, quotes or sources. If unsure or the topic may have changed recently, say so.
- You do not remember past conversations; only this conversation is available.
- Plain text only, no markdown headings.`;

function friendlyError(err: unknown): string {
  const status = APICallError.isInstance(err) ? err.statusCode : undefined;
  if (status === 401) return "The AI service isn't configured correctly (invalid API key). Please check the project's AI setup.";
  if (status === 402) return "AI credits have run out for this workspace. Add credits in workspace settings, then try again.";
  if (status === 403) return "AI access is blocked for this workspace. A workspace admin needs to enable it or raise the AI limit.";
  if (status === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (status && status >= 500) return "The AI service had a temporary problem. Please try again shortly.";
  return "The assistant couldn't reply. Please try again.";
}

export async function chatReply(input: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "The AI service isn't set up yet (missing LOVABLE_API_KEY). Add it in project secrets to enable this feature." };

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: INSTRUCTIONS,
      messages: input.messages,
      maxRetries: 0,
      providerOptions: {
        openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
      },
    } as Parameters<typeof streamText>[0]);
    const reply = (await result.text).trim();
    if (!reply) return { ok: false, error: "The assistant returned an empty reply. Please try again." };
    return { ok: true, reply };
  } catch (err) {
    console.error("Chat failed", err);
    return { ok: false, error: friendlyError(err) };
  }
}
