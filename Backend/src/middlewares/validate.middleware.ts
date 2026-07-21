import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import { ApiError } from "../utils/api-error.js";

export const validateBody = (schema: ZodType): RequestHandler => {
  return (request, _response, next): void => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(
        new ApiError(422, "Request validation failed", {
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        }),
      );
      return;
    }

    request.body = result.data;
    next();
  };
};
