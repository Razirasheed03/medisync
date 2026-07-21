import { WEEKDAYS, type Weekday } from "../constants/weekday.js";
import {
  DoctorScheduleModel,
  type ScheduleSession,
} from "../models/doctor-schedule.model.js";
import { UserModel } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";

export interface AppointmentSlot {
  readonly startTime: string;
  readonly endTime: string;
}

export interface DoctorSlotsResponse {
  readonly doctorId: string;
  readonly date: string;
  readonly duration: number;
  readonly slots: readonly AppointmentSlot[];
}

const toMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
};

const getAvailableWindows = (
  session: ScheduleSession,
): readonly [number, number][] => {
  const sessionStart = toMinutes(session.startTime);
  const sessionEnd = toMinutes(session.endTime);

  if (!session.breakStartTime || !session.breakEndTime) {
    return [[sessionStart, sessionEnd]];
  }

  return [
    [sessionStart, toMinutes(session.breakStartTime)],
    [toMinutes(session.breakEndTime), sessionEnd],
  ];
};

const getLocalDateParts = (
  date: string,
): { year: number; monthIndex: number; day: number } => {
  const [year = 0, month = 0, day = 0] = date.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
};

const getWeekday = (date: string): Weekday => {
  const { year, monthIndex, day } = getLocalDateParts(date);
  const jsWeekday = new Date(year, monthIndex, day).getDay();
  return WEEKDAYS[(jsWeekday + 6) % 7] as Weekday;
};

const isPastSlot = (
  date: string,
  startMinutes: number,
  now: Date,
): boolean => {
  const { year, monthIndex, day } = getLocalDateParts(date);

  if (
    now.getFullYear() !== year ||
    now.getMonth() !== monthIndex ||
    now.getDate() !== day
  ) {
    return false;
  }

  const slotStart = new Date(
    year,
    monthIndex,
    day,
    Math.floor(startMinutes / 60),
    startMinutes % 60,
  );
  return slotStart.getTime() < now.getTime();
};

const generateSessionSlots = (
  session: ScheduleSession,
  date: string,
  duration: number,
  now: Date,
): AppointmentSlot[] => {
  const slots: AppointmentSlot[] = [];

  for (const [windowStart, windowEnd] of getAvailableWindows(session)) {
    for (
      let start = windowStart;
      start + duration <= windowEnd;
      start += duration
    ) {
      if (!isPastSlot(date, start, now)) {
        slots.push({
          startTime: toTime(start),
          endTime: toTime(start + duration),
        });
      }
    }
  }

  return slots;
};

export const generateDoctorSlots = async (
  doctorId: string,
  date: string,
  duration = 30,
  now = new Date(),
): Promise<DoctorSlotsResponse> => {
  const doctorExists = await UserModel.exists({
    _id: doctorId,
    role: "DOCTOR",
  });

  if (!doctorExists) {
    throw new ApiError(404, "Doctor not found");
  }

  const schedule = await DoctorScheduleModel.findOne({
    doctorId,
    isActive: true,
  });
  const workingDay = schedule?.workingDays.find(
    ({ day }) => day === getWeekday(date),
  );

  const slots = (workingDay?.sessions ?? [])
    .flatMap((session) => generateSessionSlots(session, date, duration, now))
    .sort(
      (left, right) =>
        toMinutes(left.startTime) - toMinutes(right.startTime),
    );

  return {
    doctorId,
    date,
    duration,
    slots,
  };
};

