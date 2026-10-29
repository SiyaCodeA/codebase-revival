import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { featureNav } from "@/components/app/nav";
import { ResponsibleAINotice } from "@/components/app/responsible-ai-notice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      { name: "description", content: "Draft emails, summarize meetings, plan tasks and research topics in one workspace." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Draft emails, summarize meetings, plan tasks and research topics in one workspace." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Dashboard</p>
        <h1 className="text-3xl font-semibold md:text-4xl">Welcome back</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Your AI Workplace Productivity Assistant brings everyday writing, planning and research tools into one place, so you can spend less time on routine work.
        </p>
      </header>

      <ResponsibleAINotice />

      <section aria-labelledby="tools-heading" className="space-y-3">
        <h2 id="tools-heading" className="text-xl font-semibold">Tools</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {featureNav.map((f) => (
            <li key={f.url}>
              <Link
                to={f.url}
                className="group flex h-full flex-col gap-3 rounded-xl border bg-card p-5 shadow-card transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-lg font-semibold">{f.title}</span>
                <span className="text-sm text-muted-foreground">{f.description}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="quick-heading" className="rounded-xl border bg-card p-5 shadow-card">
          <h2 id="quick-heading" className="mb-3 text-lg font-semibold">Quick actions</h2>
          <ul className="space-y-1">
            {([
              ["/email", "Write an email"],
              ["/meetings", "Summarize a meeting"],
              ["/tasks", "Plan my week"],
              ["/research", "Research a topic"],
            ] as const).map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {label} <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="activity-heading" className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
          <h2 id="activity-heading" className="mb-3 text-lg font-semibold">Recent activity</h2>
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
            <Clock className="h-6 w-6 text-muted-foreground" aria-hidden />
            <p className="font-medium">No activity yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">When you use a tool, your recent drafts and summaries will show up here.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
