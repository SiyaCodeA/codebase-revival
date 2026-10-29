import { createFileRoute } from "@tanstack/react-router";
import { FeatureTool, TextField, AreaField, str } from "@/components/app/feature-tool";
import { planTasks } from "@/lib/ai/features";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner · AI Workplace Assistant" },
      { name: "description", content: "Break a goal into a prioritised, realistic task plan." },
      { property: "og:title", content: "AI Task Planner" },
      { property: "og:description", content: "Break a goal into a prioritised task plan." },
    ],
  }),
  component: () => (
    <FeatureTool
      title="AI Task Planner"
      description="Share a goal and deadline. The assistant will suggest steps, priorities and timing."
      submitLabel="Create plan"
      collect={(f) => ({ goal: str(f, "goal"), deadline: str(f, "deadline"), constraints: str(f, "constraints") })}
      validate={(i) => (!i.goal ? "Please describe the goal you want to plan." : null)}
      run={planTasks}
    >
      <AreaField id="goal" label="Goal (required)" rows={3} placeholder="e.g. Launch the new onboarding flow" />
      <TextField id="deadline" label="Deadline" type="date" />
      <AreaField id="constraints" label="Constraints" rows={4} hint="Team size, hours available, dependencies." />
    </FeatureTool>
  ),
});
