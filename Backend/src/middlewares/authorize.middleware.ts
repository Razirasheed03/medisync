import type { RequestHandler } from "express";

import type { UserRole } from "../constants/user-role.js";
import { ApiError } from "../utils/api-error.js";

export const authorize = (...allowedRoles: readonly UserRole[]): RequestHandler => {
  return (request, _response, next): void => {
    if (!request.user) {
      next(new ApiError(401, "Authentication is required"));
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(new ApiError(403, "You do not have permission to access this resource"));
      return;
    }

    next();
  };
};
