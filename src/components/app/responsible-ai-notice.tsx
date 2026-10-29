import { ShieldCheck } from "lucide-react";

export function ResponsibleAINotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      role="note"
      aria-label="Responsible AI notice"
      className="flex gap-3 rounded-lg border border-border bg-warning px-4 py-3 text-sm text-warning-foreground"
    >
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        <strong className="font-semibold">Review before you use it.</strong>{" "}
        {compact
          ? "AI-generated content can be inaccurate or incomplete. Check facts, tone and sensitive details."
          : "AI-generated content can be inaccurate, incomplete or biased. Always check facts, tone, names, dates and confidential information before sharing or acting on anything this assistant produces."}
      </p>
    </aside>
  );
}
