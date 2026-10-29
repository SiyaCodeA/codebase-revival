import { describe, it, expect } from "vitest";
import { formatMeetingSummary, meetingInputSchema } from "@/lib/ai/meeting.schema";

describe("meeting summary", () => {
  it("marks owners and deadlines that weren't stated as 'Not stated'", () => {
    const text = formatMeetingSummary("Sync", {
      overview: "o", discussionPoints: [], decisions: [], openQuestions: [],
      actionItems: [{ task: "Send deck", owner: null, deadline: null }],
    });
    expect(text).toContain("Owner: Not stated · Deadline: Not stated");
  });
  it("rejects notes shorter than 20 characters", () => {
    expect(meetingInputSchema.safeParse({ title: "", notes: "too short" }).success).toBe(false);
  });
});
