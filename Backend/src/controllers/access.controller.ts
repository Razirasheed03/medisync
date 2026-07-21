import type { Request, Response } from "express";

import {
  getAdminDashboard,
  getDoctorDashboard,
  getReceptionDashboard,
} from "../services/dashboard.service.js";
import { ApiResponse } from "../utils/api-response.js";

export const adminDashboardController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  response
    .status(200)
    .json(
      new ApiResponse(
        "Admin dashboard retrieved successfully",
        await getAdminDashboard(),
      ),
    );
};

export const receptionDashboardController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  response
    .status(200)
    .json(
      new ApiResponse(
        "Reception dashboard retrieved successfully",
        await getReceptionDashboard(),
      ),
    );
};

export const doctorDashboardController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  response
    .status(200)
    .json(
      new ApiResponse(
        "Doctor dashboard retrieved successfully",
        await getDoctorDashboard(request.user!.id),
      ),
    );
};

export const profileController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json(
    new ApiResponse("Profile access granted", {
      user: request.user!,
    }),
  );
};
