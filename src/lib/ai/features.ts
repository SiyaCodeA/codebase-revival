/**
 * One service function per feature. Each currently throws AINotConnectedError.
 * Replace a single function's body (e.g. with a createServerFn call) to enable
 * that feature without touching the others or the UI.
 */
import { AINotConnectedError, type AIResult } from "./types";
import { generateEmailFn } from "./email.functions";
import type { EmailRequest } from "./email.schema";
import { summarizeMeetingFn } from "./meeting.functions";
import { formatMeetingSummary } from "./meeting.schema";
import { planTasksFn } from "./tasks.functions";
import { formatTaskPlan } from "./tasks.schema";
import { researchFn } from "./research.functions";
import { formatResearchBrief } from "./research.schema";
import { chatFn } from "./chat.functions";
import type { ChatMessage } from "./chat.schema";

export type EmailInput = EmailRequest;
export type MeetingInput = { title: string; notes: string };
export type TaskPlanInput = { goal: string; deadline: string; constraints: string };
export type ResearchInput = { question: string; depth: string };

const notConnected = async (feature: string): Promise<AIResult> => {
  await new Promise((r) => setTimeout(r, 600));
  throw new AINotConnectedError(feature);
};

/** Smart Email Generator — live, via a server function calling Lovable AI. */
export async function generateEmail(input: EmailInput): Promise<{ subject: string; body: string }> {
  const res = await generateEmailFn({ data: input });
  if (!res.ok) throw new Error(res.error);
  return { subject: res.subject, body: res.body };
}
/** Meeting Notes Summarizer — live, via a server function calling Lovable AI. */
export async function summarizeMeeting(input: MeetingInput): Promise<AIResult> {
  const res = await summarizeMeetingFn({ data: input });
  if (!res.ok) throw new Error(res.error);
  return { text: formatMeetingSummary(input.title, res.summary) };
}
/** AI Task Planner — live, via a server function calling Lovable AI. */
export async function planTasks(input: TaskPlanInput): Promise<AIResult> {
  const res = await planTasksFn({ data: input });
  if (!res.ok) throw new Error(res.error);
  return { text: formatTaskPlan(input.goal, input.deadline, res.plan) };
}
/** AI Research Assistant — live, AI knowledge only (no web search connected). */
export async function researchTopic(input: ResearchInput): Promise<AIResult> {
  const res = await researchFn({ data: { question: input.question, depth: input.depth === "Detailed briefing" ? "Detailed briefing" : "Quick overview" } });
  if (!res.ok) throw new Error(res.error);
  return { text: formatResearchBrief(input.question, res.brief) };
}
/** AI Chat — live, multi-turn; the full conversation is sent as context. Not persisted. */
export async function sendChat(messages: ChatMessage[]): Promise<string> {
  const res = await chatFn({ data: { messages } });
  if (!res.ok) throw new Error(res.error);
  return res.reply;
}
void notConnected;
