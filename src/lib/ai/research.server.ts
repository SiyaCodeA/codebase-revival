import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, APICallError } from "ai";
import { z } from "zod";
import type { ResearchBrief, ResearchRequest, ResearchResponse } from "./research.schema";

const INSTRUCTIONS = `You are a workplace research assistant answering from your general training knowledge. You have NO web access.
Rules:
- Never claim to have searched the web, read sources, or verified anything. Do not cite URLs, studies, statistics or quotes you cannot be sure exist.
- If unsure or the topic may have changed recently, say so.
- toVerify: specific claims or areas the user should check against trusted, current sources.
- Quick overview: 3-5 key points. Detailed briefing: 6-10 key points with more depth.
- Plain text only, no markdown.`;

const briefSchema = z.object({
  overview: z.string(),
  keyPoints: z.array(z.string()),
  considerations: z.array(z.string()),
  toVerify: z.array(z.string()),
});

function friendlyError(err: unknown): string {
  const status = APICallError.isInstance(err) ? err.statusCode : undefined;
  if (status === 401) return "The AI service isn't configured correctly (invalid API key). Please check the project's AI setup.";
  if (status === 402) return "AI credits have run out for this workspace. Add credits in workspace settings, then try again.";
  if (status === 403) return "AI access is blocked for this workspace. A workspace admin needs to enable it or raise the AI limit.";
  if (status === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (status && status >= 500) return "The AI service had a temporary problem. Please try again shortly.";
  return "The research couldn't be generated. Please try again.";
}

export async function runResearch(input: ResearchRequest): Promise<ResearchResponse> {
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
      instructions: INSTRUCTIONS,
      prompt: `Depth: ${input.depth}\n\nQuestion:\n${input.question}`,
      maxRetries: 0,
      output: Output.object({ schema: briefSchema }),
      providerOptions: {
        openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
      },
    } as Parameters<typeof streamText>[0]);
    const out = (await result.output) as ResearchBrief;
    if (!out?.overview?.trim()) return { ok: false, error: "The AI returned an empty answer. Please try again." };
    return { ok: true, brief: out };
  } catch (err) {
    console.error("Research failed", err);
    return { ok: false, error: friendlyError(err) };
  }
}
