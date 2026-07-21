import type { ErrorRequestHandler } from "express";

import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { ApiError } from "../utils/api-error.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  _next,
) => {
  const apiError =
    error instanceof ApiError
      ? error
      : new ApiError(500, "Internal server error", null, {}, {
          cause: error,
        });

  logger[apiError.statusCode >= 500 ? "error" : "warn"](
    {
      error,
      requestId: request.id,
      method: request.method,
      path: request.originalUrl,
    },
    apiError.message,
  );

  response.status(apiError.statusCode).json({
    success: apiError.success,
    message: apiError.message,
    data: apiError.data,
    meta: {
      ...apiError.meta,
      ...(env.NODE_ENV === "development" ? { stack: apiError.stack } : {}),
    },
  });
};
