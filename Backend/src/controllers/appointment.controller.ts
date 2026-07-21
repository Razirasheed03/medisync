import type { Request, Response } from "express";

import type { AppointmentStatus } from "../constants/appointment-status.js";
import {
  cancelAppointment,
  createAppointment,
  getAppointment,
  listAppointments,
  updateAppointment,
} from "../services/appointment.service.js";
import { ApiResponse } from "../utils/api-response.js";
import type {
  CreateAppointmentBody,
  UpdateAppointmentBody,
} from "../validators/appointment.validator.js";

export const createAppointmentController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const appointment = await createAppointment(
    request.body as CreateAppointmentBody,
  );
  response
    .status(201)
    .json(new ApiResponse("Appointment created successfully", appointment));
};

export const listAppointmentsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await listAppointments({
    ...(request.query.doctorId
      ? { doctorId: request.query.doctorId as string }
      : {}),
    ...(request.query.date ? { date: request.query.date as string } : {}),
    ...(request.query.status
      ? { status: request.query.status as AppointmentStatus }
      : {}),
    page: Number(request.query.page ?? 1),
    limit: Number(request.query.limit ?? 20),
    sortOrder: (request.query.sortOrder as "asc" | "desc" | undefined) ?? "asc",
  });

  response.status(200).json(
    new ApiResponse(
      "Appointments retrieved successfully",
      result.appointments,
      { pagination: result.pagination },
    ),
  );
};

export const getAppointmentController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json(
    new ApiResponse(
      "Appointment retrieved successfully",
      await getAppointment(request.params.id as string),
    ),
  );
};

export const updateAppointmentController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const appointment = await updateAppointment(
    request.params.id as string,
    request.body as UpdateAppointmentBody,
  );
  response
    .status(200)
    .json(new ApiResponse("Appointment updated successfully", appointment));
};

export const cancelAppointmentController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const appointment = await cancelAppointment(request.params.id as string);
  response
    .status(200)
    .json(new ApiResponse("Appointment cancelled successfully", appointment));
};
