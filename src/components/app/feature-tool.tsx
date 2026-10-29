import { useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "./page-header";
import { ResponsibleAINotice } from "./responsible-ai-notice";
import type { AIResult } from "@/lib/ai/types";

type Status = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "done"; text: string };

/** Shared shell for each AI tool: form on the left, output panel on the right. */
export function FeatureTool<T>({
  title, description, submitLabel, children, collect, validate, run,
}: {
  title: string;
  description: string;
  submitLabel: string;
  children: ReactNode;
  collect: (form: FormData) => T;
  validate: (input: T) => string | null;
  run: (input: T) => Promise<AIResult>;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = collect(new FormData(e.currentTarget));
    const problem = validate(input);
    if (problem) return setStatus({ kind: "error", message: problem });
    setStatus({ kind: "loading" });
    try {
      const res = await run(input);
      setStatus({ kind: "done", text: res.text });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    }
  }

  const loading = status.kind === "loading";

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <ResponsibleAINotice compact />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-xl border bg-card p-5 shadow-card md:p-6" aria-busy={loading}>
          {children}
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            {loading ? "Working…" : submitLabel}
          </Button>
        </form>
        <section aria-labelledby="output-heading" className="rounded-xl border bg-card p-5 shadow-card md:p-6">
          <h2 id="output-heading" className="mb-3 text-lg font-semibold">Output</h2>
          <div aria-live="polite">
            {status.kind === "idle" && (
              <p className="text-sm text-muted-foreground">Fill in the form and submit. Results will appear here for you to review.</p>
            )}
            {status.kind === "loading" && (
              <div className="space-y-2" role="status">
                <span className="sr-only">Generating…</span>
                {[90, 75, 82, 60].map((w) => (
                  <div key={w} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}
            {status.kind === "error" && (
              <div role="alert" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>{status.message}</p>
              </div>
            )}
            {status.kind === "done" && <div className="whitespace-pre-wrap text-sm">{status.text}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string | undefined; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({ id, label, hint, placeholder, type = "text" }: { id: string; label: string; hint?: string; placeholder?: string; type?: string }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Input id={id} name={id} type={type} placeholder={placeholder} aria-describedby={hint ? `${id}-hint` : undefined} />
    </Field>
  );
}

export function AreaField({ id, label, hint, placeholder, rows = 6 }: { id: string; label: string; hint?: string; placeholder?: string; rows?: number }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Textarea id={id} name={id} rows={rows} placeholder={placeholder} aria-describedby={hint ? `${id}-hint` : undefined} />
    </Field>
  );
}

export function SelectField({ id, label, options }: { id: string; label: string; options: string[] }) {
  return (
    <Field id={id} label={label}>
      <select id={id} name={id} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </Field>
  );
}

export const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
