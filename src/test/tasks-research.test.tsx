import { describe, it, expect } from "vitest";
import { formatTaskPlan, taskPlanInputSchema } from "@/lib/ai/tasks.schema";
import { formatResearchBrief, researchInputSchema } from "@/lib/ai/research.schema";

describe("task planner", () => {
  it("shows 'Not specified' timing when the user gave none", () => {
    const t = formatTaskPlan("Launch", "", { summary: "s", assumptions: [], missingInfo: [], steps: [{ task: "Draft", priority: "High", timing: null, dependsOn: null }] });
    expect(t).toContain("Timing: Not specified");
    expect(t).toContain("Deadline: Not provided");
  });
  it("rejects an empty goal", () => {
    expect(taskPlanInputSchema.safeParse({ goal: " ", deadline: "", constraints: "" }).success).toBe(false);
  });
});

describe("research", () => {
  it("labels results as unverified, no web search", () => {
    expect(formatResearchBrief("q?", { overview: "o", keyPoints: [], considerations: [], toVerify: [] })).toContain("No web search was performed");
  });
  it("rejects questions under 5 characters", () => {
    expect(researchInputSchema.safeParse({ question: "hi", depth: "Quick overview" }).success).toBe(false);
  });
});
