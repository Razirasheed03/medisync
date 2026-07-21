import { Error as MongooseError } from "mongoose";

import type { AppointmentStatus } from "../constants/appointment-status.js";
import {
  AppointmentModel,
  type AppointmentDocument,
} from "../models/appointment.model.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreateAppointmentBody,
  UpdateAppointmentBody,
} from "../validators/appointment.validator.js";
import { generateDoctorSlots } from "./doctor-slot.service.js";

export interface AppointmentResponse {
  readonly id: string;
  readonly patientName: string;
  readonly patientEmail: string;
  readonly patientPhone: string;
  readonly doctorId: string;
  readonly appointmentDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly status: AppointmentStatus;
  readonly notes?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ListAppointmentsInput {
  readonly doctorId?: string;
  readonly date?: string;
  readonly status?: AppointmentStatus;
  readonly page: number;
  readonly limit: number;
  readonly sortOrder: "asc" | "desc";
}

export interface AppointmentPagination {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface ListAppointmentsResult {
  readonly appointments: readonly AppointmentResponse[];
  readonly pagination: AppointmentPagination;
}

interface SlotDetails {
  readonly doctorId: string;
  readonly appointmentDate: string;
  readonly startTime: string;
  readonly endTime: string;
}

const toAppointmentResponse = (
  appointment: AppointmentDocument,
): AppointmentResponse => ({
  id: appointment.id as string,
  patientName: appointment.patientName,
  patientEmail: appointment.patientEmail,
  patientPhone: appointment.patientPhone,
  doctorId: appointment.doctor.toString(),
  appointmentDate: appointment.appointmentDate,
  startTime: appointment.startTime,
  endTime: appointment.endTime,
  status: appointment.status,
  ...(appointment.notes !== undefined ? { notes: appointment.notes } : {}),
  createdAt: appointment.createdAt,
  updatedAt: appointment.updatedAt,
});

const toMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toLocalDateTime = (date: string, time: string): Date => {
  const [year = 0, month = 0, day = 0] = date.split("-").map(Number);
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

const assertSlotIsBookable = async (
  slot: SlotDetails,
  now = new Date(),
): Promise<void> => {
  const duration = toMinutes(slot.endTime) - toMinutes(slot.startTime);

  if (duration <= 0) {
    throw new ApiError(422, "Appointment end time must be after start time");
  }

  if (toLocalDateTime(slot.appointmentDate, slot.startTime) < now) {
    throw new ApiError(422, "Appointments cannot be booked in the past");
  }

  const generatedSlots = await generateDoctorSlots(
    slot.doctorId,
    slot.appointmentDate,
    duration,
    now,
  );
  const belongsToSchedule = generatedSlots.slots.some(
    ({ startTime, endTime }) =>
      startTime === slot.startTime && endTime === slot.endTime,
  );

  if (!belongsToSchedule) {
    throw new ApiError(
      422,
      "Requested slot is not part of the doctor's active schedule",
    );
  }
};

const assertSlotIsAvailable = async (
  slot: SlotDetails,
  excludeAppointmentId?: string,
): Promise<void> => {
  const conflictingAppointment = await AppointmentModel.exists({
    doctor: slot.doctorId,
    appointmentDate: slot.appointmentDate,
    status: { $ne: "CANCELLED" },
    startTime: { $lt: slot.endTime },
    endTime: { $gt: slot.startTime },
    ...(excludeAppointmentId ? { _id: { $ne: excludeAppointmentId } } : {}),
  });

  if (conflictingAppointment) {
    throw new ApiError(409, "The requested appointment slot is already booked");
  }
};

const isDuplicateKeyError = (error: unknown): error is { code: number } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000;

const throwPersistenceError = (error: unknown): never => {
  if (isDuplicateKeyError(error)) {
    throw new ApiError(409, "The requested appointment slot is already booked");
  }

  if (error instanceof MongooseError.ValidationError) {
    throw new ApiError(422, "Appointment validation failed", {
      issues: Object.values(error.errors).map((validationError) => ({
        path: validationError.path,
        message: validationError.message,
      })),
    });
  }

  throw error;
};

const findAppointmentOrThrow = async (
  appointmentId: string,
): Promise<AppointmentDocument> => {
  const appointment = await AppointmentModel.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  return appointment;
};

export const createAppointment = async (
  input: CreateAppointmentBody,
): Promise<AppointmentResponse> => {
  const slot: SlotDetails = {
    doctorId: input.doctorId,
    appointmentDate: input.appointmentDate,
    startTime: input.startTime,
    endTime: input.endTime,
  };

  await assertSlotIsBookable(slot);
  await assertSlotIsAvailable(slot);

  try {
    const appointment = await AppointmentModel.create({
      patientName: input.patientName,
      patientEmail: input.patientEmail,
      patientPhone: input.patientPhone,
      doctor: input.doctorId,
      appointmentDate: input.appointmentDate,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "BOOKED",
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });
    return toAppointmentResponse(appointment);
  } catch (error) {
    return throwPersistenceError(error);
  }
};

export const listAppointments = async (
  input: ListAppointmentsInput,
): Promise<ListAppointmentsResult> => {
  const filter = {
    ...(input.doctorId ? { doctor: input.doctorId } : {}),
    ...(input.date ? { appointmentDate: input.date } : {}),
    ...(input.status ? { status: input.status } : {}),
  };
  const sortDirection = input.sortOrder === "asc" ? 1 : -1;
  const skip = (input.page - 1) * input.limit;

  const [appointments, total] = await Promise.all([
    AppointmentModel.find(filter)
      .sort({
        appointmentDate: sortDirection,
        startTime: sortDirection,
        _id: sortDirection,
      })
      .skip(skip)
      .limit(input.limit),
    AppointmentModel.countDocuments(filter),
  ]);

  return {
    appointments: appointments.map(toAppointmentResponse),
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    },
  };
};

export const getAppointment = async (
  appointmentId: string,
): Promise<AppointmentResponse> =>
  toAppointmentResponse(await findAppointmentOrThrow(appointmentId));

export const updateAppointment = async (
  appointmentId: string,
  input: UpdateAppointmentBody,
): Promise<AppointmentResponse> => {
  const appointment = await findAppointmentOrThrow(appointmentId);
  const slot: SlotDetails = {
    doctorId: input.doctorId ?? appointment.doctor.toString(),
    appointmentDate: input.appointmentDate ?? appointment.appointmentDate,
    startTime: input.startTime ?? appointment.startTime,
    endTime: input.endTime ?? appointment.endTime,
  };
  const targetStatus = input.status ?? appointment.status;
  const slotChanged =
    slot.doctorId !== appointment.doctor.toString() ||
    slot.appointmentDate !== appointment.appointmentDate ||
    slot.startTime !== appointment.startTime ||
    slot.endTime !== appointment.endTime;
  const reactivating =
    appointment.status === "CANCELLED" && targetStatus !== "CANCELLED";
  const booking =
    targetStatus === "BOOKED" && appointment.status !== "BOOKED";

  if (slotChanged || booking) {
    await assertSlotIsBookable(slot);
  }

  if (targetStatus !== "CANCELLED" && (slotChanged || reactivating)) {
    await assertSlotIsAvailable(slot, appointmentId);
  }

  appointment.set({
    ...(input.patientName !== undefined
      ? { patientName: input.patientName }
      : {}),
    ...(input.patientEmail !== undefined
      ? { patientEmail: input.patientEmail }
      : {}),
    ...(input.patientPhone !== undefined
      ? { patientPhone: input.patientPhone }
      : {}),
    ...(input.doctorId !== undefined ? { doctor: input.doctorId } : {}),
    ...(input.appointmentDate !== undefined
      ? { appointmentDate: input.appointmentDate }
      : {}),
    ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
    ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  });

  if (input.notes === null) {
    appointment.set("notes", undefined);
  } else if (input.notes !== undefined) {
    appointment.set("notes", input.notes);
  }

  try {
    await appointment.save();
    return toAppointmentResponse(appointment);
  } catch (error) {
    return throwPersistenceError(error);
  }
};

export const cancelAppointment = async (
  appointmentId: string,
): Promise<AppointmentResponse> => {
  const appointment = await findAppointmentOrThrow(appointmentId);

  if (appointment.status !== "CANCELLED") {
    appointment.status = "CANCELLED";
    await appointment.save();
  }

  return toAppointmentResponse(appointment);
};

