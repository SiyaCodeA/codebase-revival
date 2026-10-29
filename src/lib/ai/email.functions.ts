import { createServerFn } from "@tanstack/react-start";
import { emailInputSchema } from "./email.schema";
import { writeEmail } from "./email.server";

export const generateEmailFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => emailInputSchema.parse(data))
  .handler(async ({ data }) => writeEmail(data));
