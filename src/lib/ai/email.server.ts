import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, APICallError } from "ai";
import { z } from "zod";
import type { EmailRequest, EmailResponse } from "./email.schema";

const INSTRUCTIONS = `You write workplace emails. Return a subject line and an email body.
Rules:
- Use ONLY the information the user supplies. Never invent names, dates, times, figures, facts, commitments, or company details.
- When something needed is missing (e.g. recipient name, sender name, date), use clear square-bracket placeholders such as [Recipient name], [Your name], [Date].
- Match the requested tone exactly: Formal = polished and respectful; Friendly = warm and approachable but professional; Persuasive = clear benefits and a confident call to action, without exaggeration.
- Include a greeting, the key points in a logical order, and a sign-off. Plain text only, no markdown.`;

function friendlyError(err: unknown): string {
  const status = APICallError.isInstance(err) ? err.statusCode : undefined;
  if (status === 401) return "The AI service isn't configured correctly (invalid API key). Please check the project's AI setup.";
  if (status === 402) return "AI credits have run out for this workspace. Add credits in workspace settings, then try again.";
  if (status === 403) return "AI access is blocked for this workspace. A workspace admin needs to enable it or raise the AI limit.";
  if (status === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (status && status >= 500) return "The AI service had a temporary problem. Please try again shortly.";
  return "The email couldn't be generated. Please try again.";
}

export async function writeEmail(input: EmailRequest): Promise<EmailResponse> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "The AI service isn't set up yet (missing LOVABLE_API_KEY). Add it in project secrets to enable this feature." };

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  const prompt = [
    `Tone: ${input.tone}`,
    `Recipient: ${input.recipient || "(not provided)"}`,
    `Purpose: ${input.purpose}`,
    `Key points to include:\n${input.keyPoints || "(none provided)"}`,
    `Additional context:\n${input.context || "(none provided)"}`,
  ].join("\n\n");

  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      instructions: INSTRUCTIONS,
      prompt,
      maxRetries: 0,
      output: Output.object({ schema: z.object({ subject: z.string(), body: z.string() }) }),
      providerOptions: {
        openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
      },
    } as Parameters<typeof streamText>[0]);
    const out = (await result.output) as { subject: string; body: string };
    if (!out?.body?.trim()) return { ok: false, error: "The AI returned an empty email. Please try again." };
    return { ok: true, subject: out.subject.trim(), body: out.body.trim() };
  } catch (err) {
    console.error("Email generation failed", err);
    return { ok: false, error: friendlyError(err) };
  }
}
