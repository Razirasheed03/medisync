import type { Request, Response } from "express";

import type { Department } from "../constants/department.js";
import { listDoctors } from "../services/doctor.service.js";
import { ApiResponse } from "../utils/api-response.js";

export const listDoctorsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const department = request.query.department as Department | undefined;

  response
    .status(200)
    .json(
      new ApiResponse(
        "Doctors retrieved successfully",
        await listDoctors(department),
      ),
    );
};
