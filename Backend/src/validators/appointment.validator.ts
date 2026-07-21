import { z } from "zod";

import { APPOINTMENT_STATUSES } from "../constants/appointment-status.js";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Must be a valid MongoDB ObjectId");

const timeSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Time must use 24-hour HH:mm format");

const isCalendarDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 0) - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === (month ?? 0) - 1 &&
    date.getUTCDate() === day
  );
};

const appointmentDateSchema = z
  .string()
  .refine(isCalendarDate, "Date must be a valid date in YYYY-MM-DD format");

const appointmentFields = {
  patientName: z.string().trim().min(2).max(100),
  patientEmail: z.string().trim().email().max(254),
  patientPhone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(
      /^\+?[0-9\s().-]+$/,
      "Phone number contains unsupported characters",
    ),
  doctorId: objectIdSchema,
  appointmentDate: appointmentDateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  notes: z.string().trim().max(2000).optional(),
};

const validateTimeRange = (
  value: {
    startTime?: string | undefined;
    endTime?: string | undefined;
  },
  context: z.RefinementCtx,
): void => {
  if (
    value.startTime !== undefined &&
    value.endTime !== undefined &&
    value.endTime <= value.startTime
  ) {
    context.addIssue({
      code: "custom",
      path: ["endTime"],
      message: "End time must be after start time",
    });
  }
};

export const createAppointmentBodySchema = z
  .object(appointmentFields)
  .strict()
  .superRefine(validateTimeRange);

export const updateAppointmentBodySchema = z
  .object({
    patientName: appointmentFields.patientName.optional(),
    patientEmail: appointmentFields.patientEmail.optional(),
    patientPhone: appointmentFields.patientPhone.optional(),
    doctorId: appointmentFields.doctorId.optional(),
    appointmentDate: appointmentFields.appointmentDate.optional(),
    startTime: appointmentFields.startTime.optional(),
    endTime: appointmentFields.endTime.optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  })
  .superRefine(validateTimeRange);

export const appointmentIdParamsSchema = z
  .object({
    id: objectIdSchema,
  })
  .strict();

export const listAppointmentsQuerySchema = z
  .object({
    doctorId: objectIdSchema.optional(),
    date: appointmentDateSchema.optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    page: z
      .string()
      .regex(/^[1-9]\d*$/, "Page must be a positive integer")
      .optional(),
    limit: z
      .string()
      .regex(/^[1-9]\d*$/, "Limit must be a positive integer")
      .refine((value) => Number(value) <= 100, "Limit cannot exceed 100")
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .strict();

export type CreateAppointmentBody = z.infer<
  typeof createAppointmentBodySchema
>;
export type UpdateAppointmentBody = z.infer<
  typeof updateAppointmentBodySchema
>;

