import type { Request, Response } from "express";

import { ApiResponse } from "../utils/api-response.js";

const createDashboardController = (dashboard: string) => {
  return async (_request: Request, response: Response): Promise<void> => {
    response.status(200).json(
      new ApiResponse(`${dashboard} dashboard access granted`, {
        dashboard,
      }),
    );
  };
};

export const adminDashboardController = createDashboardController("Admin");
export const receptionDashboardController =
  createDashboardController("Reception");
export const doctorDashboardController = createDashboardController("Doctor");

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
