import type { Request, Response } from "express";

import { getHealth } from "../services/health.service.js";
import { ApiResponse } from "../utils/api-response.js";

export const healthController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json(new ApiResponse("Server is healthy", getHealth()));
};
