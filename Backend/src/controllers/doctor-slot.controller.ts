import type { Request, Response } from "express";

import { generateDoctorSlots } from "../services/doctor-slot.service.js";
import { ApiResponse } from "../utils/api-response.js";

export const getDoctorSlotsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const date = request.query.date as string;
  const duration = request.query.duration
    ? Number(request.query.duration)
    : undefined;
  const result = await generateDoctorSlots(
    request.params.doctorId as string,
    date,
    duration,
  );

  response
    .status(200)
    .json(new ApiResponse("Doctor slots generated successfully", result));
};

