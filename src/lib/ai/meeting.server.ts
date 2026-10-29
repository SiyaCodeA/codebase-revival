import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, APICallError } from "ai";
import { z } from "zod";
import type { MeetingRequest, MeetingResponse, MeetingSummary } from "./meeting.schema";

const INSTRUCTIONS = `You summarise workplace meeting notes into a structured summary.
Rules:
- Use ONLY information in the notes. Never invent names, decisions, responsibilities, deadlines, figures or facts.
- decisions: only things the notes show were actually agreed or decided. Ideas or proposals are discussion points, not decisions.
- actionItems: tasks/next steps mentioned in the notes. owner = the person explicitly named as responsible, otherwise null. deadline = a date/time explicitly stated, otherwise null. Never guess.
- openQuestions: unresolved questions, open issues and follow-ups mentioned in the notes.
- Use empty arrays when a section has nothing in the notes.
- overview: 1-3 sentences. Plain text only, no markdown.`;

const summarySchema = z.object({
  overview: z.string(),
  discussionPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(z.object({ task: z.string(), owner: z.string().nullable(), deadline: z.string().nullable() })),
  openQuestions: z.array(z.string()),
});

function friendlyError(err: unknown): string {
  const status = APICallError.isInstance(err) ? err.statusCode : undefined;
  if (status === 401) return "The AI service isn't configured correctly (invalid API key). Please check the project's AI setup.";
  if (status === 402) return "AI credits have run out for this workspace. Add credits in workspace settings, then try again.";
  if (status === 403) return "AI access is blocked for this workspace. A workspace admin needs to enable it or raise the AI limit.";
  if (status === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (status && status >= 500) return "The AI service had a temporary problem. Please try again shortly.";
  return "The summary couldn't be generated. Please try again.";
}

export async function summarizeMeetingNotes(input: MeetingRequest): Promise<MeetingResponse> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "The AI service isn't set up yet (missing LOVABLE_API_KEY). Add it in project secrets to enable this feature." };

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  const prompt = `Meeting title: ${input.title || "(not provided)"}\n\nNotes:\n${input.notes}`;

  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      instructions: INSTRUCTIONS,
      prompt,
      maxRetries: 0,
      output: Output.object({ schema: summarySchema }),
      providerOptions: {
        openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
      },
    } as Parameters<typeof streamText>[0]);
    const out = (await result.output) as MeetingSummary;
    if (!out?.overview?.trim()) return { ok: false, error: "The AI returned an empty summary. Please try again." };
    return { ok: true, summary: out };
  } catch (err) {
    console.error("Meeting summary failed", err);
    return { ok: false, error: friendlyError(err) };
  }
}
