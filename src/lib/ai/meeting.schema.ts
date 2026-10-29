import { z } from "zod";

export const meetingInputSchema = z.object({
  title: z.string().trim().max(200),
  notes: z.string().trim().min(20, "Please paste at least a few sentences of meeting notes.").max(30000, "Notes are too long (max 30,000 characters)."),
});
export type MeetingRequest = z.infer<typeof meetingInputSchema>;

export type MeetingSummary = {
  overview: string;
  discussionPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string | null; deadline: string | null }[];
  openQuestions: string[];
};
export type MeetingResponse = { ok: true; summary: MeetingSummary } | { ok: false; error: string };

/** Plain-text rendering used for display and copying. Unstated owners/deadlines say so explicitly. */
export function formatMeetingSummary(title: string, s: MeetingSummary): string {
  const list = (items: string[]) => (items.length ? items.map((i) => `• ${i}`).join("\n") : "• None recorded in the notes");
  const actions = s.actionItems.length
    ? s.actionItems
        .map((a) => `• ${a.task}\n   Owner: ${a.owner ?? "Not stated"} · Deadline: ${a.deadline ?? "Not stated"}`)
        .join("\n")
    : "• None recorded in the notes";
  return [
    title ? `${title}\n` : "",
    `MEETING OVERVIEW\n${s.overview}`,
    `KEY DISCUSSION POINTS\n${list(s.discussionPoints)}`,
    `DECISIONS MADE\n${list(s.decisions)}`,
    `ACTION ITEMS & NEXT STEPS\n${actions}`,
    `OUTSTANDING QUESTIONS & FOLLOW-UPS\n${list(s.openQuestions)}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
