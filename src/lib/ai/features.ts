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
export const planTasks = (_input: TaskPlanInput) => notConnected("AI Task Planner");
export const researchTopic = (_input: ResearchInput) => notConnected("AI Research Assistant");
