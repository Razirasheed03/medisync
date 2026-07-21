import { z } from "zod";

import { APPOINTMENT_STATUSES } from "../constants/appointment-status.js";
import { DEPARTMENTS } from "../constants/department.js";

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

const patientNameSchema = z.string().trim().min(2).max(100);
const patientEmailSchema = z
  .email()
  .max(254)
  .transform((email) => email.toLowerCase());
const patientPhoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(30)
  .regex(
    /^\+?[0-9\s().-]+$/,
    "Phone number contains unsupported characters",
  );

const slotFields = {
  doctorId: objectIdSchema,
  appointmentDate: appointmentDateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
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

/**
 * Booking works with either an existing patient (`patientId`) or inline
 * new-patient details, which auto-create a patient record.
 */
export const createAppointmentBodySchema = z
  .object({
    patientId: objectIdSchema.optional(),
    patientName: patientNameSchema.optional(),
    patientEmail: patientEmailSchema.optional(),
    patientPhone: patientPhoneSchema.optional(),
    ...slotFields,
    purpose: z.string().trim().max(500).optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    validateTimeRange(value, context);

    if (value.patientId !== undefined) return;

    if (value.patientName === undefined) {
      context.addIssue({
        code: "custom",
        path: ["patientName"],
        message: "Patient name is required when patientId is not provided",
      });
    }

    if (value.patientPhone === undefined) {
      context.addIssue({
        code: "custom",
        path: ["patientPhone"],
        message: "Patient phone is required when patientId is not provided",
      });
    }
  });

export const updateAppointmentBodySchema = z
  .object({
    doctorId: slotFields.doctorId.optional(),
    appointmentDate: slotFields.appointmentDate.optional(),
    startTime: slotFields.startTime.optional(),
    endTime: slotFields.endTime.optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    purpose: z.string().trim().max(500).nullable().optional(),
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
    search: z.string().trim().max(100).optional(),
    doctorId: objectIdSchema.optional(),
    department: z.enum(DEPARTMENTS).optional(),
    date: appointmentDateSchema.optional(),
    dateFrom: appointmentDateSchema.optional(),
    dateTo: appointmentDateSchema.optional(),
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
  .strict()
  .superRefine((value, context) => {
    if (
      value.dateFrom !== undefined &&
      value.dateTo !== undefined &&
      value.dateTo < value.dateFrom
    ) {
      context.addIssue({
        code: "custom",
        path: ["dateTo"],
        message: "dateTo must be on or after dateFrom",
      });
    }
  });

export type CreateAppointmentBody = z.infer<
  typeof createAppointmentBodySchema
>;
export type UpdateAppointmentBody = z.infer<
  typeof updateAppointmentBodySchema
>;
export type ListAppointmentsQuery = z.infer<
  typeof listAppointmentsQuerySchema
>;
