import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Must be a valid MongoDB ObjectId");

const patientFields = {
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(
      /^\+?[0-9\s().-]+$/,
      "Phone number contains unsupported characters",
    ),
  email: z
    .email()
    .max(254)
    .transform((email) => email.toLowerCase())
    .optional(),
};

export const createPatientBodySchema = z.object(patientFields).strict();

export const patientIdParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

export const listPatientsQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
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

export type CreatePatientBody = z.infer<typeof createPatientBodySchema>;
