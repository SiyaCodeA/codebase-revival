import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, APICallError } from "ai";
import { z } from "zod";
import type { TaskPlan, TaskPlanRequest, TaskPlanResponse } from "./tasks.schema";

const INSTRUCTIONS = `You turn a workplace goal into a practical, prioritised task plan.
Rules:
- Base every step on the user's goal, deadline and constraints. Do not invent owners, people, dates, budgets, tools or facts.
- timing: only relative timing derived from the user's deadline (e.g. "first week", "before the deadline"), or null when no deadline was given. Never make up specific calendar dates.
- dependsOn: the earlier step this one needs, or null.
- assumptions: any assumption you had to make to structure the plan.
- missingInfo: details the user should confirm (e.g. who owns what, if not given).
- 3-10 steps. Plain text only, no markdown.`;

const planSchema = z.object({
  summary: z.string(),
  steps: z.array(z.object({ task: z.string(), priority: z.enum(["High", "Medium", "Low"]), timing: z.string().nullable(), dependsOn: z.string().nullable() })),
  assumptions: z.array(z.string()),
  missingInfo: z.array(z.string()),
});

function friendlyError(err: unknown): string {
  const status = APICallError.isInstance(err) ? err.statusCode : undefined;
  if (status === 401) return "The AI service isn't configured correctly (invalid API key). Please check the project's AI setup.";
  if (status === 402) return "AI credits have run out for this workspace. Add credits in workspace settings, then try again.";
  if (status === 403) return "AI access is blocked for this workspace. A workspace admin needs to enable it or raise the AI limit.";
  if (status === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (status && status >= 500) return "The AI service had a temporary problem. Please try again shortly.";
  return "The plan couldn't be generated. Please try again.";
}

export async function createTaskPlan(input: TaskPlanRequest): Promise<TaskPlanResponse> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "The AI service isn't set up yet (missing LOVABLE_API_KEY). Add it in project secrets to enable this feature." };
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const prompt = [
    `Today's date: ${new Date().toISOString().slice(0, 10)}`,
    `Goal:\n${input.goal}`,
    `Deadline: ${input.deadline || "(not provided)"}`,
    `Constraints:\n${input.constraints || "(none provided)"}`,
  ].join("\n\n");
  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      instructions: INSTRUCTIONS,
      prompt,
      maxRetries: 0,
      output: Output.object({ schema: planSchema }),
      providerOptions: {
        openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
      },
    } as Parameters<typeof streamText>[0]);
    const out = (await result.output) as TaskPlan;
    if (!out?.summary?.trim()) return { ok: false, error: "The AI returned an empty plan. Please try again." };
    return { ok: true, plan: out };
  } catch (err) {
    console.error("Task plan failed", err);
    return { ok: false, error: friendlyError(err) };
  }
}
