import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Check, Copy, Eraser, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/page-header";
import { ResponsibleAINotice } from "@/components/app/responsible-ai-notice";
import { Field } from "@/components/app/feature-tool";
import { generateEmail, type EmailInput } from "@/lib/ai/features";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · AI Workplace Assistant" },
      { name: "description", content: "Draft professional emails from a few notes, then review before sending." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Draft professional emails from a few notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;
const empty: EmailInput = { recipient: "", purpose: "", keyPoints: "", context: "", tone: "Formal" };

function EmailPage() {
  const [form, setForm] = useState<EmailInput>(empty);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof EmailInput) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function run() {
    if (!form.purpose.trim()) {
      setFieldError("Please describe the purpose of the email.");
      return;
    }
    setFieldError(null);
    setError(null);
    setLoading(true);
    try {
      setDraft(await generateEmail(form));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy to the clipboard. Please select the text and copy it manually.");
    }
  }

  function clear() {
    setForm(empty);
    setDraft(null);
    setError(null);
    setFieldError(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Smart Email Generator" description="Describe who you're writing to and why. The assistant drafts an email you can edit before sending." />
      <ResponsibleAINotice compact />
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={(e: FormEvent) => { e.preventDefault(); void run(); }}
          noValidate
          aria-busy={loading}
          className="space-y-5 rounded-xl border bg-card p-5 shadow-card md:p-6"
        >
          <Field id="recipient" label="Recipient">
            <Input id="recipient" value={form.recipient} onChange={set("recipient")} maxLength={200} placeholder="e.g. Finance team" />
          </Field>
          <Field id="purpose" label="Email purpose (required)" hint={fieldError ?? undefined}>
            <Input
              id="purpose" value={form.purpose} onChange={set("purpose")} maxLength={500} required
              aria-invalid={!!fieldError} aria-describedby={fieldError ? "purpose-hint" : undefined}
              placeholder="e.g. Request budget approval for Q1"
              className={fieldError ? "border-destructive" : undefined}
            />
          </Field>
          <Field id="keyPoints" label="Key points to include" hint="One per line works well.">
            <Textarea id="keyPoints" rows={5} value={form.keyPoints} onChange={set("keyPoints")} maxLength={4000} aria-describedby="keyPoints-hint" />
          </Field>
          <Field id="context" label="Additional context (optional)" hint="Background, names, dates or figures you want used.">
            <Textarea id="context" rows={3} value={form.context} onChange={set("context")} maxLength={4000} aria-describedby="context-hint" />
          </Field>
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Tone</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {TONES.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
                  <input type="radio" name="tone" value={t} checked={form.tone === t} onChange={() => setForm((f) => ({ ...f, tone: t }))} className="accent-primary" />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
              {loading ? "Generating…" : "Generate Email"}
            </Button>
            <Button type="button" variant="ghost" onClick={clear} disabled={loading}>
              <Eraser className="h-4 w-4" aria-hidden /> Clear
            </Button>
          </div>
        </form>

        <section aria-labelledby="output-heading" className="rounded-xl border bg-card p-5 shadow-card md:p-6">
          <h2 id="output-heading" className="mb-3 text-lg font-semibold">Generated email</h2>
          <div aria-live="polite" className="space-y-4">
            {error && (
              <div role="alert" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>{error}</p>
              </div>
            )}
            {loading && (
              <div className="space-y-2" role="status">
                <span className="sr-only">Generating email…</span>
                {[90, 75, 82, 60].map((w) => <div key={w} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />)}
              </div>
            )}
            {!loading && !draft && !error && (
              <p className="text-sm text-muted-foreground">Fill in the form and select Generate Email. Your draft will appear here to review and edit.</p>
            )}
            {!loading && draft && (
              <>
                <Field id="subject" label="Subject">
                  <Input id="subject" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
                </Field>
                <Field id="body" label="Body">
                  <Textarea id="body" rows={14} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
                </Field>
                <p className="text-xs text-muted-foreground">Replace any [placeholders] and check every detail before sending.</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={copy}>
                    {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                    {copied ? "Copied" : "Copy Email"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => void run()}>
                    <RefreshCw className="h-4 w-4" aria-hidden /> Regenerate
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
