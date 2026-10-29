import { z } from "zod";

export const emailInputSchema = z.object({
  recipient: z.string().trim().max(200),
  purpose: z.string().trim().min(1, "Please describe the purpose of the email.").max(500),
  keyPoints: z.string().trim().max(4000),
  context: z.string().trim().max(4000),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
});
export type EmailRequest = z.infer<typeof emailInputSchema>;
export type EmailResponse = { ok: true; subject: string; body: string } | { ok: false; error: string };

