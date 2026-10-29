import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AlertCircle, Loader2, MessageSquare, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/app/page-header";
import { ResponsibleAINotice } from "@/components/app/responsible-ai-notice";
import { sendChat } from "@/lib/ai/features";
import { MAX_CHAT_MESSAGES, type ChatMessage } from "@/lib/ai/chat.schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat · AI Workplace Assistant" },
      { name: "description", content: "Chat with an AI workplace assistant to draft, brainstorm and get answers." },
      { property: "og:title", content: "AI Chat · Workplace Assistant" },
      { property: "og:description", content: "Chat with an AI workplace assistant to draft, brainstorm and get answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, loading]);
  useEffect(() => { if (!loading) inputRef.current?.focus(); }, [loading]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (loading) return;
    if (!text) return setError("Please type a message first.");
    if (messages.length + 1 > MAX_CHAT_MESSAGES) return setError("This conversation is getting long. Start a new conversation to continue.");
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setDraft("");
    setError(null);
    setLoading(true);
    try {
      const reply = await sendChat(next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setMessages(messages);
      setDraft(text);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); }
  }

  function reset() { setMessages([]); setDraft(""); setError(null); inputRef.current?.focus(); }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="AI Chat" description="Ask questions, brainstorm or draft ideas in a conversation. Earlier messages in this chat are used as context." />
        <Button type="button" variant="outline" onClick={reset} disabled={loading || (messages.length === 0 && !draft)}>
          <RotateCcw className="h-4 w-4" aria-hidden /> New conversation
        </Button>
      </div>
      <ResponsibleAINotice compact />
      <section aria-label="Conversation" className="flex min-h-[420px] flex-col rounded-xl border bg-card shadow-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6" aria-live="polite">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <MessageSquare className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-lg font-semibold">How can I help with your workday?</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Type a message below to start. This chat isn't saved and the assistant can't browse the web, so check important facts.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-foreground")}>
                <span className="sr-only">{m.role === "user" ? "You: " : "Assistant: "}</span>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start" role="status">
              <div className="flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        {error && (
          <div role="alert" className="mx-4 mb-2 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive md:mx-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={send} className="flex items-end gap-2 border-t p-3 md:p-4">
          <label htmlFor="chat-input" className="sr-only">Message</label>
          <Textarea
            id="chat-input" ref={inputRef} value={draft} rows={2} disabled={loading}
            onChange={(e) => { setDraft(e.target.value); if (error) setError(null); }}
            onKeyDown={onKeyDown} placeholder="Type a message… (Enter to send, Shift+Enter for a new line)"
            className="min-h-[44px] flex-1 resize-none"
          />
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            Send
          </Button>
        </form>
      </section>
    </div>
  );
}
