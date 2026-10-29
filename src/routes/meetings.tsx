import { createFileRoute } from "@tanstack/react-router";
import { FeatureTool, TextField, AreaField, str } from "@/components/app/feature-tool";
import { summarizeMeeting } from "@/lib/ai/features";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer · AI Workplace Assistant" },
      { name: "description", content: "Turn raw meeting notes into a summary, decisions and action items." },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      { property: "og:description", content: "Turn raw meeting notes into decisions and action items." },
    ],
  }),
  component: () => (
    <FeatureTool
      title="Meeting Notes Summarizer"
      description="Paste your notes or transcript. The assistant will pull out a summary, decisions and action items."
      submitLabel="Summarize notes"
      collect={(f) => ({ title: str(f, "title"), notes: str(f, "notes") })}
      validate={(i) => (i.notes.length < 20 ? "Please paste at least a few sentences of meeting notes." : null)}
      run={summarizeMeeting}
      actions
    >
      <TextField id="title" label="Meeting title" placeholder="e.g. Weekly product sync" />
      <AreaField id="notes" label="Notes or transcript (required)" rows={10} hint="Avoid pasting confidential information you're not permitted to share." />
    </FeatureTool>
  ),
});
