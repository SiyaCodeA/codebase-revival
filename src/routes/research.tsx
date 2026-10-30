import { createFileRoute } from "@tanstack/react-router";
import { FeatureTool, AreaField, SelectField, str } from "@/components/app/feature-tool";
import { researchTopic } from "@/lib/ai/features";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant · AI Workplace Assistant" },
      { name: "description", content: "Explore a work question and get a structured overview to verify." },
      { property: "og:title", content: "Research Assistant" },
      { property: "og:description", content: "Explore a question and get a structured overview." },
    ],
  }),
  component: () => (
    <FeatureTool
      title="Research Assistant"
      description="Ask a question. The assistant will outline key points and considerations. Always verify against trusted sources."
      submitLabel="Research"
      collect={(f) => ({ question: str(f, "question"), depth: str(f, "depth") })}
      validate={(i) => (i.question.length < 5 ? "Please enter a research question." : null)}
      run={researchTopic}
      actions
    >
      <AreaField id="question" label="Research question (required)" rows={4} placeholder="e.g. What are best practices for hybrid team rituals?" />
      <SelectField id="depth" label="Depth" options={["Quick overview", "Detailed briefing"]} />
    </FeatureTool>
  ),
});
