import { createServerFn } from "@tanstack/react-start";
import { researchInputSchema } from "./research.schema";
import { runResearch } from "./research.server";

export const researchFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => researchInputSchema.parse(data))
  .handler(async ({ data }) => runResearch(data));
