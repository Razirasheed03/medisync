import { z } from "zod";

import { DEPARTMENTS } from "../constants/department.js";
import { USER_STATUSES } from "../constants/user-status.js";

const manageableRoleSchema = z.enum(["DOCTOR", "RECEPTIONIST"]);
const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Must be a valid MongoDB ObjectId");

const nameSchema = z.string().trim().min(2).max(100);
const emailSchema = z
  .email()
  .max(254)
  .transform((email) => email.toLowerCase());
const passwordSchema = z.string().min(8).max(128);

export const createUserBodySchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: manageableRoleSchema,
    department: z.enum(DEPARTMENTS).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.role === "DOCTOR" && value.department === undefined) {
      context.addIssue({
        code: "custom",
        path: ["department"],
        message: "Department is required for doctors",
      });
    }
  });

export const updateUserBodySchema = z
  .object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    role: manageableRoleSchema.optional(),
    status: z.enum(USER_STATUSES).optional(),
    department: z.enum(DEPARTMENTS).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const resetUserPasswordBodySchema = z
  .object({
    password: passwordSchema,
  })
  .strict();

export const userIdParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

export const listUsersQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    role: manageableRoleSchema.optional(),
    status: z.enum(USER_STATUSES).optional(),
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

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type ResetUserPasswordBody = z.infer<
  typeof resetUserPasswordBodySchema
>;
