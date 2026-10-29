import { createServerFn } from "@tanstack/react-start";
import { taskPlanInputSchema } from "./tasks.schema";
import { createTaskPlan } from "./tasks.server";

export const planTasksFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => taskPlanInputSchema.parse(data))
  .handler(async ({ data }) => createTaskPlan(data));
