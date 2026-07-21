import { Error as MongooseError } from "mongoose";
import type mongoose from "mongoose";

import {
  APPOINTMENT_STATUS_TRANSITIONS,
  type AppointmentStatus,
} from "../constants/appointment-status.js";
import type { Department } from "../constants/department.js";
import { emitAppointmentEvent } from "../lib/socket.js";
import {
  AppointmentModel,
  type Appointment,
  type AppointmentDocument,
} from "../models/appointment.model.js";
import { UserModel } from "../models/user.model.js";
import type { RequestUser } from "../types/auth.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreateAppointmentBody,
  UpdateAppointmentBody,
} from "../validators/appointment.validator.js";
import { recordAuditEvent } from "./audit.service.js";
import { generateDoctorSlots } from "./doctor-slot.service.js";
import {
  createPatient,
  findPatientDocumentOrThrow,
} from "./patient.service.js";

export interface AppointmentResponse {
  readonly id: string;
  readonly patientId: string;
  readonly patientName: string;
  readonly patientEmail?: string;
  readonly patientPhone: string;
  readonly doctorId: string;
  readonly department: Department;
  readonly appointmentDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly status: AppointmentStatus;
  readonly purpose?: string;
  readonly notes?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ListAppointmentsInput {
  readonly search?: string;
  readonly doctorId?: string;
  readonly department?: Department;
  readonly date?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
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
  patientId: appointment.patient.toString(),
  patientName: appointment.patientName,
  ...(appointment.patientEmail !== undefined
    ? { patientEmail: appointment.patientEmail }
    : {}),
  patientPhone: appointment.patientPhone,
  doctorId: appointment.doctor.toString(),
  department: appointment.department,
  appointmentDate: appointment.appointmentDate,
  startTime: appointment.startTime,
  endTime: appointment.endTime,
  status: appointment.status,
  ...(appointment.purpose !== undefined
    ? { purpose: appointment.purpose }
    : {}),
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

const assertActorCanAccess = (
  actor: RequestUser,
  appointment: AppointmentDocument,
): void => {
  if (
    actor.role === "DOCTOR" &&
    appointment.doctor.toString() !== actor.id
  ) {
    throw new ApiError(
      403,
      "Doctors can only access their own appointments",
    );
  }
};

const assertStatusTransition = (
  from: AppointmentStatus,
  to: AppointmentStatus,
): void => {
  if (from === to) return;

  if (!APPOINTMENT_STATUS_TRANSITIONS[from].includes(to)) {
    throw new ApiError(
      422,
      `Appointment status cannot change from ${from} to ${to}`,
    );
  }
};

const getDoctorDepartment = async (doctorId: string): Promise<Department> => {
  const doctor = await UserModel.findOne({
    _id: doctorId,
    role: "DOCTOR",
    status: { $ne: "INACTIVE" },
  }).select("department");

  if (!doctor) {
    throw new ApiError(422, "doctorId must reference an existing doctor");
  }

  return doctor.department ?? "GENERAL_MEDICINE";
};

interface PatientSnapshot {
  readonly patientId: string;
  readonly patientName: string;
  readonly patientEmail?: string;
  readonly patientPhone: string;
}

/**
 * Resolves the patient for a booking: reuses an existing record when
 * `patientId` is provided, otherwise auto-creates a new patient.
 */
const resolvePatient = async (
  input: CreateAppointmentBody,
): Promise<PatientSnapshot> => {
  if (input.patientId) {
    const patient = await findPatientDocumentOrThrow(input.patientId);
    return {
      patientId: patient.id as string,
      patientName: patient.name,
      ...(patient.email !== undefined ? { patientEmail: patient.email } : {}),
      patientPhone: patient.phone,
    };
  }

  const patient = await createPatient({
    name: input.patientName as string,
    phone: input.patientPhone as string,
    ...(input.patientEmail !== undefined
      ? { email: input.patientEmail }
      : {}),
  });

  return {
    patientId: patient.id,
    patientName: patient.name,
    ...(patient.email !== undefined ? { patientEmail: patient.email } : {}),
    patientPhone: patient.phone,
  };
};

export const createAppointment = async (
  input: CreateAppointmentBody,
  actor: RequestUser,
): Promise<AppointmentResponse> => {
  const slot: SlotDetails = {
    doctorId: input.doctorId,
    appointmentDate: input.appointmentDate,
    startTime: input.startTime,
    endTime: input.endTime,
  };

  await assertSlotIsBookable(slot);
  await assertSlotIsAvailable(slot);

  const department = await getDoctorDepartment(input.doctorId);
  const patient = await resolvePatient(input);

  try {
    const appointment = await AppointmentModel.create({
      patient: patient.patientId,
      patientName: patient.patientName,
      ...(patient.patientEmail !== undefined
        ? { patientEmail: patient.patientEmail }
        : {}),
      patientPhone: patient.patientPhone,
      doctor: input.doctorId,
      department,
      appointmentDate: input.appointmentDate,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "BOOKED",
      ...(input.purpose !== undefined ? { purpose: input.purpose } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });

    const response = toAppointmentResponse(appointment);
    await recordAuditEvent({
      actor,
      action: "APPOINTMENT_CREATED",
      entityType: "Appointment",
      entityId: response.id,
      metadata: {
        doctorId: response.doctorId,
        appointmentDate: response.appointmentDate,
        startTime: response.startTime,
      },
    });
    emitAppointmentEvent("appointment:created", response);
    return response;
  } catch (error) {
    return throwPersistenceError(error);
  }
};

export const listAppointments = async (
  input: ListAppointmentsInput,
  actor: RequestUser,
): Promise<ListAppointmentsResult> => {
  const escapeRegExp = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const search = input.search
    ? new RegExp(escapeRegExp(input.search), "i")
    : undefined;
  const dateRange = {
    ...(input.dateFrom ? { $gte: input.dateFrom } : {}),
    ...(input.dateTo ? { $lte: input.dateTo } : {}),
  };
  const filter: mongoose.QueryFilter<Appointment> = {
    // Doctors only ever see their own appointments.
    ...(actor.role === "DOCTOR"
      ? { doctor: actor.id }
      : input.doctorId
        ? { doctor: input.doctorId }
        : {}),
    ...(input.department ? { department: input.department } : {}),
    ...(input.date
      ? { appointmentDate: input.date }
      : Object.keys(dateRange).length > 0
        ? { appointmentDate: dateRange }
        : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(search
      ? { $or: [{ patientName: search }, { patientPhone: search }] }
      : {}),
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
  actor: RequestUser,
): Promise<AppointmentResponse> => {
  const appointment = await findAppointmentOrThrow(appointmentId);
  assertActorCanAccess(actor, appointment);
  return toAppointmentResponse(appointment);
};

const DOCTOR_UPDATABLE_FIELDS = ["notes", "status"] as const;

export const updateAppointment = async (
  appointmentId: string,
  input: UpdateAppointmentBody,
  actor: RequestUser,
): Promise<AppointmentResponse> => {
  const appointment = await findAppointmentOrThrow(appointmentId);
  assertActorCanAccess(actor, appointment);

  if (actor.role === "DOCTOR") {
    const disallowedField = Object.keys(input).find(
      (field) =>
        !DOCTOR_UPDATABLE_FIELDS.includes(
          field as (typeof DOCTOR_UPDATABLE_FIELDS)[number],
        ),
    );

    if (disallowedField) {
      throw new ApiError(
        403,
        "Doctors can only update consultation notes and completion status",
      );
    }

    if (input.status !== undefined && input.status !== "COMPLETED") {
      throw new ApiError(
        403,
        "Doctors can only mark appointments as completed",
      );
    }

    // Consultation starts once the receptionist marks the patient arrived.
    if (appointment.status !== "ARRIVED") {
      throw new ApiError(
        422,
        "Consultation notes can only be updated after the patient has arrived",
      );
    }
  }

  const slot: SlotDetails = {
    doctorId: input.doctorId ?? appointment.doctor.toString(),
    appointmentDate: input.appointmentDate ?? appointment.appointmentDate,
    startTime: input.startTime ?? appointment.startTime,
    endTime: input.endTime ?? appointment.endTime,
  };
  const targetStatus = input.status ?? appointment.status;

  if (input.status !== undefined) {
    assertStatusTransition(appointment.status, input.status);
  }

  const doctorChanged = slot.doctorId !== appointment.doctor.toString();
  const slotChanged =
    doctorChanged ||
    slot.appointmentDate !== appointment.appointmentDate ||
    slot.startTime !== appointment.startTime ||
    slot.endTime !== appointment.endTime;
  const reactivating =
    appointment.status === "CANCELLED" && targetStatus !== "CANCELLED";
  const booking = targetStatus === "BOOKED" && appointment.status !== "BOOKED";

  if (slotChanged || booking) {
    await assertSlotIsBookable(slot);
  }

  if (targetStatus !== "CANCELLED" && (slotChanged || reactivating)) {
    await assertSlotIsAvailable(slot, appointmentId);
  }

  appointment.set({
    ...(input.doctorId !== undefined ? { doctor: input.doctorId } : {}),
    ...(doctorChanged
      ? { department: await getDoctorDepartment(slot.doctorId) }
      : {}),
    ...(input.appointmentDate !== undefined
      ? { appointmentDate: input.appointmentDate }
      : {}),
    ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
    ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  });

  if (input.purpose === null) {
    appointment.set("purpose", undefined);
  } else if (input.purpose !== undefined) {
    appointment.set("purpose", input.purpose);
  }

  if (input.notes === null) {
    appointment.set("notes", undefined);
  } else if (input.notes !== undefined) {
    appointment.set("notes", input.notes);
  }

  try {
    await appointment.save();

    const response = toAppointmentResponse(appointment);
    await recordAuditEvent({
      actor,
      action: "APPOINTMENT_UPDATED",
      entityType: "Appointment",
      entityId: response.id,
      metadata: { updatedFields: Object.keys(input) },
    });
    emitAppointmentEvent("appointment:updated", response);
    return response;
  } catch (error) {
    return throwPersistenceError(error);
  }
};

export const markAppointmentArrived = async (
  appointmentId: string,
  actor: RequestUser,
): Promise<AppointmentResponse> => {
  const appointment = await findAppointmentOrThrow(appointmentId);

  if (appointment.status === "ARRIVED") {
    throw new ApiError(422, "Patient has already been marked as arrived");
  }

  assertStatusTransition(appointment.status, "ARRIVED");

  appointment.status = "ARRIVED";
  await appointment.save();

  const response = toAppointmentResponse(appointment);
  await recordAuditEvent({
    actor,
    action: "APPOINTMENT_UPDATED",
    entityType: "Appointment",
    entityId: response.id,
    metadata: { status: "ARRIVED" },
  });
  emitAppointmentEvent("appointment:updated", response);
  return response;
};

export const cancelAppointment = async (
  appointmentId: string,
  actor: RequestUser,
): Promise<AppointmentResponse> => {
  const appointment = await findAppointmentOrThrow(appointmentId);

  if (appointment.status !== "CANCELLED") {
    assertStatusTransition(appointment.status, "CANCELLED");
    appointment.status = "CANCELLED";
    await appointment.save();

    await recordAuditEvent({
      actor,
      action: "APPOINTMENT_CANCELLED",
      entityType: "Appointment",
      entityId: appointment.id as string,
    });
    emitAppointmentEvent(
      "appointment:cancelled",
      toAppointmentResponse(appointment),
    );
  }

  return toAppointmentResponse(appointment);
};
