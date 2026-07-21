import type { Request, Response } from "express";

import {
  cancelAppointment,
  createAppointment,
  getAppointment,
  listAppointments,
  markAppointmentArrived,
  updateAppointment,
} from "../services/appointment.service.js";
import { ApiResponse } from "../utils/api-response.js";
import type {
  CreateAppointmentBody,
  ListAppointmentsQuery,
  UpdateAppointmentBody,
} from "../validators/appointment.validator.js";

export const createAppointmentController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const appointment = await createAppointment(
    request.body as CreateAppointmentBody,
    request.user!,
  );
  response
    .status(201)
    .json(new ApiResponse("Appointment created successfully", appointment));
};

export const listAppointmentsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const query = request.query as ListAppointmentsQuery;
  const result = await listAppointments(
    {
      ...(query.search ? { search: query.search } : {}),
      ...(query.doctorId ? { doctorId: query.doctorId } : {}),
      ...(query.department ? { department: query.department } : {}),
      ...(query.date ? { date: query.date } : {}),
      ...(query.dateFrom ? { dateFrom: query.dateFrom } : {}),
      ...(query.dateTo ? { dateTo: query.dateTo } : {}),
      ...(query.status ? { status: query.status } : {}),
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
      sortOrder: query.sortOrder ?? "asc",
    },
    request.user!,
  );

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
      await getAppointment(request.params.id as string, request.user!),
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
    request.user!,
  );
  response
    .status(200)
    .json(new ApiResponse("Appointment updated successfully", appointment));
};

export const markAppointmentArrivedController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const appointment = await markAppointmentArrived(
    request.params.id as string,
    request.user!,
  );
  response
    .status(200)
    .json(new ApiResponse("Patient marked as arrived", appointment));
};

export const cancelAppointmentController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const appointment = await cancelAppointment(
    request.params.id as string,
    request.user!,
  );
  response
    .status(200)
    .json(new ApiResponse("Appointment cancelled successfully", appointment));
};
