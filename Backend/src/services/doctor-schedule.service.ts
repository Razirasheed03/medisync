import { Error as MongooseError } from "mongoose";

import {
  DoctorScheduleModel,
  type DoctorScheduleDocument,
  type ScheduleSession,
  type WorkingDay,
} from "../models/doctor-schedule.model.js";
import { UserModel } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreateDoctorScheduleBody,
  UpdateDoctorScheduleBody,
  UpdateDoctorScheduleStatusBody,
} from "../validators/doctor-schedule.validator.js";

export interface DoctorScheduleResponse {
  readonly id: string;
  readonly doctorId: string;
  readonly workingDays: readonly WorkingDay[];
  readonly slotDuration: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

const normalizeWorkingDays = (
  workingDays: CreateDoctorScheduleBody["workingDays"],
): WorkingDay[] =>
  workingDays.map((workingDay) => ({
    day: workingDay.day,
    sessions: workingDay.sessions.map((session) => ({
      startTime: session.startTime,
      endTime: session.endTime,
      ...(session.breakStartTime
        ? { breakStartTime: session.breakStartTime }
        : {}),
      ...(session.breakEndTime ? { breakEndTime: session.breakEndTime } : {}),
    })),
  }));

const toScheduleResponse = (
  schedule: DoctorScheduleDocument,
): DoctorScheduleResponse => ({
  id: schedule.id as string,
  doctorId: schedule.doctorId.toString(),
  workingDays: schedule.workingDays.map((workingDay) => ({
    day: workingDay.day,
    sessions: workingDay.sessions.map(
      (session): ScheduleSession => ({
        startTime: session.startTime,
        endTime: session.endTime,
        ...(session.breakStartTime
          ? { breakStartTime: session.breakStartTime }
          : {}),
        ...(session.breakEndTime ? { breakEndTime: session.breakEndTime } : {}),
      }),
    ),
  })),
  slotDuration: schedule.slotDuration,
  isActive: schedule.isActive,
  createdAt: schedule.createdAt,
  updatedAt: schedule.updatedAt,
});

const isDuplicateKeyError = (error: unknown): error is { code: number } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000;

const throwPersistenceError = (error: unknown): never => {
  if (isDuplicateKeyError(error)) {
    throw new ApiError(409, "A schedule already exists for this doctor");
  }

  if (error instanceof MongooseError.ValidationError) {
    throw new ApiError(422, "Schedule validation failed", {
      issues: Object.values(error.errors).map((validationError) => ({
        path: validationError.path,
        message: validationError.message,
      })),
    });
  }

  throw error;
};

const findScheduleOrThrow = async (
  doctorId: string,
): Promise<DoctorScheduleDocument> => {
  const schedule = await DoctorScheduleModel.findOne({ doctorId });

  if (!schedule) {
    throw new ApiError(404, "Doctor schedule not found");
  }

  return schedule;
};

export const createDoctorSchedule = async (
  input: CreateDoctorScheduleBody,
): Promise<DoctorScheduleResponse> => {
  const doctorExists = await UserModel.exists({
    _id: input.doctorId,
    role: "DOCTOR",
  });

  if (!doctorExists) {
    throw new ApiError(422, "doctorId must reference an existing doctor");
  }

  try {
    const schedule = await DoctorScheduleModel.create({
      doctorId: input.doctorId,
      workingDays: normalizeWorkingDays(input.workingDays),
      slotDuration: input.slotDuration,
      isActive: input.isActive,
    });
    return toScheduleResponse(schedule);
  } catch (error) {
    return throwPersistenceError(error);
  }
};

export const listDoctorSchedules = async (): Promise<
  readonly DoctorScheduleResponse[]
> => {
  const schedules = await DoctorScheduleModel.find().sort({ doctorId: 1 });
  return schedules.map(toScheduleResponse);
};

export const getDoctorSchedule = async (
  doctorId: string,
): Promise<DoctorScheduleResponse> =>
  toScheduleResponse(await findScheduleOrThrow(doctorId));

export const updateDoctorSchedule = async (
  doctorId: string,
  input: UpdateDoctorScheduleBody,
): Promise<DoctorScheduleResponse> => {
  try {
    const schedule = await DoctorScheduleModel.findOneAndUpdate(
      { doctorId },
      {
        $set: {
          workingDays: normalizeWorkingDays(input.workingDays),
          slotDuration: input.slotDuration,
        },
      },
      { new: true, runValidators: true },
    );

    if (!schedule) {
      throw new ApiError(404, "Doctor schedule not found");
    }

    return toScheduleResponse(schedule);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return throwPersistenceError(error);
  }
};

export const updateDoctorScheduleStatus = async (
  doctorId: string,
  input: UpdateDoctorScheduleStatusBody,
): Promise<DoctorScheduleResponse> => {
  const schedule = await DoctorScheduleModel.findOneAndUpdate(
    { doctorId },
    { $set: { isActive: input.isActive } },
    { new: true, runValidators: true },
  );

  if (!schedule) {
    throw new ApiError(404, "Doctor schedule not found");
  }

  return toScheduleResponse(schedule);
};
