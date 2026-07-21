import type { RequestHandler } from "express";

import { verifyAccessToken } from "../services/auth.service.js";
import { ApiError } from "../utils/api-error.js";

export const verifyJWT: RequestHandler = (request, _response, next) => {
  const authorization = request.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    next(new ApiError(401, "Access token is required"));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    next(new ApiError(401, "Access token is required"));
    return;
  }

  try {
    request.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
};
