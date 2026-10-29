import { z } from "zod";

export const researchInputSchema = z.object({
  question: z.string().trim().min(5, "Please enter a research question.").max(2000),
  depth: z.enum(["Quick overview", "Detailed briefing"]),
});
export type ResearchRequest = z.infer<typeof researchInputSchema>;

export type ResearchBrief = {
  overview: string;
  keyPoints: string[];
  considerations: string[];
  toVerify: string[];
};
export type ResearchResponse = { ok: true; brief: ResearchBrief } | { ok: false; error: string };

/** No web search is connected, so every result is labelled as unverified AI knowledge. */
export const RESEARCH_SOURCE_NOTICE =
  "SOURCE: AI general knowledge only. No web search was performed and no sources were checked. Information may be out of date — verify before relying on it.";

export function formatResearchBrief(question: string, b: ResearchBrief): string {
  const list = (items: string[]) => (items.length ? items.map((i) => `• ${i}`).join("\n") : "• None");
  return [
    RESEARCH_SOURCE_NOTICE,
    `QUESTION\n${question}`,
    `OVERVIEW\n${b.overview}`,
    `KEY POINTS\n${list(b.keyPoints)}`,
    `CONSIDERATIONS\n${list(b.considerations)}`,
    `WHAT TO VERIFY\n${list(b.toVerify)}`,
  ].join("\n\n");
}
