import { z } from "zod";

import { AUDIT_ACTIONS } from "../constants/audit-action.js";

export const listAuditLogsQuerySchema = z
  .object({
    action: z.enum(AUDIT_ACTIONS).optional(),
    page: z
      .string()
      .regex(/^[1-9]\d*$/, "Page must be a positive integer")
      .optional(),
    limit: z
      .string()
      .regex(/^[1-9]\d*$/, "Limit must be a positive integer")
      .refine((value) => Number(value) <= 100, "Limit cannot exceed 100")
      .optional(),
  })
  .strict();
