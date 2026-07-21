import { z } from "zod";

export const loginBodySchema = z
  .object({
    email: z.email().max(254).transform((email) => email.toLowerCase()),
    password: z.string().min(1).max(128),
  })
  .strict();

export const emptyBodySchema = z.object({}).strict();

export type LoginBody = z.infer<typeof loginBodySchema>;
