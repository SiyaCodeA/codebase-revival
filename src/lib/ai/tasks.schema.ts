import { z } from "zod";

export const taskPlanInputSchema = z.object({
  goal: z.string().trim().min(1, "Please describe the goal you want to plan.").max(2000),
  deadline: z.string().trim().max(50),
  constraints: z.string().trim().max(5000),
});
export type TaskPlanRequest = z.infer<typeof taskPlanInputSchema>;

export type TaskPlan = {
  summary: string;
  steps: { task: string; priority: "High" | "Medium" | "Low"; timing: string | null; dependsOn: string | null }[];
  assumptions: string[];
  missingInfo: string[];
};
export type TaskPlanResponse = { ok: true; plan: TaskPlan } | { ok: false; error: string };

/** Plain-text rendering for display/copy. Steps without user-given timing say so. */
export function formatTaskPlan(goal: string, deadline: string, p: TaskPlan): string {
  const list = (items: string[], empty: string) => (items.length ? items.map((i) => `• ${i}`).join("\n") : `• ${empty}`);
  const steps = p.steps.length
    ? p.steps
        .map((s, i) => `${i + 1}. ${s.task}\n   Priority: ${s.priority} · Timing: ${s.timing ?? "Not specified"}${s.dependsOn ? ` · After: ${s.dependsOn}` : ""}`)
        .join("\n")
    : "No steps could be suggested from the goal provided.";
  return [
    `GOAL\n${goal}\nDeadline: ${deadline || "Not provided"}`,
    `PLAN OVERVIEW\n${p.summary}`,
    `SUGGESTED STEPS\n${steps}`,
    `ASSUMPTIONS\n${list(p.assumptions, "None")}`,
    `INFORMATION TO CONFIRM\n${list(p.missingInfo, "None")}`,
  ].join("\n\n");
}
