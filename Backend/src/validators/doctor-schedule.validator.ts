import { z } from "zod";

import { WEEKDAYS } from "../constants/weekday.js";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Must be a valid MongoDB ObjectId");
const timeSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Time must use 24-hour HH:mm format");

const toMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const sessionSchema = z
  .object({
    startTime: timeSchema,
    endTime: timeSchema,
    breakStartTime: timeSchema.optional(),
    breakEndTime: timeSchema.optional(),
  })
  .strict()
  .superRefine((session, context) => {
    const sessionStart = toMinutes(session.startTime);
    const sessionEnd = toMinutes(session.endTime);

    if (sessionEnd <= sessionStart) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Session end time must be after its start time",
      });
    }

    const hasBreakStart = session.breakStartTime !== undefined;
    const hasBreakEnd = session.breakEndTime !== undefined;

    if (hasBreakStart !== hasBreakEnd) {
      context.addIssue({
        code: "custom",
        path: [hasBreakStart ? "breakEndTime" : "breakStartTime"],
        message: "Break start and end times must be provided together",
      });
      return;
    }

    if (session.breakStartTime && session.breakEndTime) {
      const breakStart = toMinutes(session.breakStartTime);
      const breakEnd = toMinutes(session.breakEndTime);

      if (breakEnd <= breakStart) {
        context.addIssue({
          code: "custom",
          path: ["breakEndTime"],
          message: "Break end time must be after its start time",
        });
      }

      if (breakStart <= sessionStart || breakEnd >= sessionEnd) {
        context.addIssue({
          code: "custom",
          path: ["breakStartTime"],
          message: "Break must be fully inside the session",
        });
      }
    }
  });

export const workingDaySchema = z
  .object({
    day: z.enum(WEEKDAYS),
    sessions: z.array(sessionSchema).min(1, "At least one session is required"),
  })
  .strict()
  .superRefine((workingDay, context) => {
    const sessions = workingDay.sessions
      .map((session, index) => ({
        index,
        start: toMinutes(session.startTime),
        end: toMinutes(session.endTime),
      }))
      .sort((left, right) => left.start - right.start);

    for (let index = 1; index < sessions.length; index += 1) {
      const previous = sessions[index - 1];
      const current = sessions[index];

      if (previous && current && current.start < previous.end) {
        context.addIssue({
          code: "custom",
          path: ["sessions", current.index],
          message: "Sessions within the same day must not overlap",
        });
      }
    }
  });

export const workingDaysSchema = z
  .array(workingDaySchema)
  .min(1, "At least one working day is required")
  .max(7)
  .superRefine((workingDays, context) => {
    const seen = new Set<string>();

    workingDays.forEach((workingDay, index) => {
      if (seen.has(workingDay.day)) {
        context.addIssue({
          code: "custom",
          path: [index, "day"],
          message: `Duplicate working day: ${workingDay.day}`,
        });
      }
      seen.add(workingDay.day);
    });
  });

const scheduleFields = {
  workingDays: workingDaysSchema,
  slotDuration: z
    .number()
    .int("Slot duration must be an integer")
    .positive("Slot duration must be positive"),
};

export const createDoctorScheduleBodySchema = z
  .object({
    doctorId: objectIdSchema,
    ...scheduleFields,
    isActive: z.boolean().default(true),
  })
  .strict();

export const updateDoctorScheduleBodySchema = z
  .object(scheduleFields)
  .strict();

export const updateDoctorScheduleStatusBodySchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export const doctorIdParamsSchema = z
  .object({
    doctorId: objectIdSchema,
  })
  .strict();

export type CreateDoctorScheduleBody = z.infer<
  typeof createDoctorScheduleBodySchema
>;
export type UpdateDoctorScheduleBody = z.infer<
  typeof updateDoctorScheduleBodySchema
>;
export type UpdateDoctorScheduleStatusBody = z.infer<
  typeof updateDoctorScheduleStatusBodySchema
>;
