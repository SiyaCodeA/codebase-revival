import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · AI Workplace Assistant" },
      { name: "description", content: "Preferences and AI connection status for your workplace assistant." },
      { property: "og:title", content: "Settings" },
      { property: "og:description", content: "Preferences and AI connection status." },
    ],
  }),
  component: Settings,
});

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage preferences for your assistant." />
      <section aria-labelledby="ai-status" className="rounded-xl border bg-card p-5 shadow-card md:p-6">
        <h2 id="ai-status" className="text-lg font-semibold">AI connection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Status: <span className="font-medium text-foreground">Not connected</span>. The tools can be used to prepare input, but won't generate content until an AI service is set up.
        </p>
      </section>
      <section aria-labelledby="prefs" className="rounded-xl border bg-card p-5 shadow-card md:p-6">
        <h2 id="prefs" className="text-lg font-semibold">Preferences</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">These options aren't saved yet.</p>
        <div className="space-y-4">
          {[
            ["review-reminder", "Show review reminder on every tool", true],
            ["concise", "Prefer concise outputs", false],
          ].map(([id, label, def]) => (
            <div key={id as string} className="flex items-center justify-between gap-4">
              <Label htmlFor={id as string}>{label as string}</Label>
              <Switch id={id as string} defaultChecked={def as boolean} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
