import { createServerFn } from "@tanstack/react-start";
import { chatInputSchema } from "./chat.schema";
import { chatReply } from "./chat.server";

export const chatFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => chatInputSchema.parse(data))
  .handler(async ({ data }) => chatReply(data));
