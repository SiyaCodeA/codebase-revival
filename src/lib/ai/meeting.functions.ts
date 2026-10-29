import { createServerFn } from "@tanstack/react-start";
import { meetingInputSchema } from "./meeting.schema";
import { summarizeMeetingNotes } from "./meeting.server";

export const summarizeMeetingFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => meetingInputSchema.parse(data))
  .handler(async ({ data }) => summarizeMeetingNotes(data));
