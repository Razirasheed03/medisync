import {
  Schema,
  model,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

import { WEEKDAYS, type Weekday } from "../constants/weekday.js";
import { workingDaysSchema } from "../validators/doctor-schedule.validator.js";

export interface ScheduleSession {
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface WorkingDay {
  day: Weekday;
  sessions: ScheduleSession[];
}

export interface DoctorSchedule {
  doctorId: Types.ObjectId;
  workingDays: WorkingDay[];
  slotDuration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DoctorScheduleDocument = HydratedDocument<DoctorSchedule>;

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const sessionSchema = new Schema<ScheduleSession>(
  {
    startTime: {
      type: String,
      required: true,
      match: timePattern,
    },
    endTime: {
      type: String,
      required: true,
      match: timePattern,
    },
    breakStartTime: {
      type: String,
      match: timePattern,
    },
    breakEndTime: {
      type: String,
      match: timePattern,
    },
  },
  { _id: false },
);

const workingDaySchema = new Schema<WorkingDay>(
  {
    day: {
      type: String,
      enum: WEEKDAYS,
      required: true,
    },
    sessions: {
      type: [sessionSchema],
      required: true,
      validate: {
        validator: (sessions: ScheduleSession[]) => sessions.length > 0,
        message: "At least one session is required for each working day",
      },
    },
  },
  { _id: false },
);

const doctorScheduleSchema = new Schema<
  DoctorSchedule,
  Model<DoctorSchedule>
>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
    },
    workingDays: {
      type: [workingDaySchema],
      required: true,
      validate: {
        validator: (workingDays: WorkingDay[]) =>
          workingDaysSchema.safeParse(
            workingDays.map((workingDay) => ({
              day: workingDay.day,
              sessions: workingDay.sessions.map((session) => ({
                startTime: session.startTime,
                endTime: session.endTime,
                ...(session.breakStartTime
                  ? { breakStartTime: session.breakStartTime }
                  : {}),
                ...(session.breakEndTime
                  ? { breakEndTime: session.breakEndTime }
                  : {}),
              })),
            })),
          ).success,
        message: "Working days or sessions violate schedule constraints",
      },
    },
    slotDuration: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Slot duration must be an integer",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DoctorScheduleModel = model<DoctorSchedule>(
  "DoctorSchedule",
  doctorScheduleSchema,
);
