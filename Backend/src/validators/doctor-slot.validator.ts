import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const isCalendarDate = (value: string): boolean => {
  if (!datePattern.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 0) - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === (month ?? 0) - 1 &&
    date.getUTCDate() === day
  );
};

export const doctorSlotsQuerySchema = z
  .object({
    date: z
      .string()
      .refine(isCalendarDate, "Date must be a valid date in YYYY-MM-DD format"),
    duration: z
      .string()
      .regex(/^[1-9]\d*$/, "Duration must be a positive integer")
      .optional(),
  })
  .strict();

