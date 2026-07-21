import type { Request, Response } from "express";

import {
  createDoctorSchedule,
  getDoctorSchedule,
  listDoctorSchedules,
  updateDoctorSchedule,
  updateDoctorScheduleStatus,
} from "../services/doctor-schedule.service.js";
import { ApiResponse } from "../utils/api-response.js";
import type {
  CreateDoctorScheduleBody,
  UpdateDoctorScheduleBody,
  UpdateDoctorScheduleStatusBody,
} from "../validators/doctor-schedule.validator.js";

export const createDoctorScheduleController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const schedule = await createDoctorSchedule(
    request.body as CreateDoctorScheduleBody,
  );
  response
    .status(201)
    .json(new ApiResponse("Doctor schedule created successfully", schedule));
};

export const listDoctorSchedulesController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json(
    new ApiResponse(
      "Doctor schedules retrieved successfully",
      await listDoctorSchedules(),
    ),
  );
};

export const getDoctorScheduleController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json(
    new ApiResponse(
      "Doctor schedule retrieved successfully",
      await getDoctorSchedule(request.params.doctorId as string),
    ),
  );
};

export const updateDoctorScheduleController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const schedule = await updateDoctorSchedule(
    request.params.doctorId as string,
    request.body as UpdateDoctorScheduleBody,
  );
  response
    .status(200)
    .json(new ApiResponse("Doctor schedule updated successfully", schedule));
};

export const updateDoctorScheduleStatusController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const schedule = await updateDoctorScheduleStatus(
    request.params.doctorId as string,
    request.body as UpdateDoctorScheduleStatusBody,
  );
  response
    .status(200)
    .json(new ApiResponse("Doctor schedule status updated successfully", schedule));
};
