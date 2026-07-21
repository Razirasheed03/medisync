import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import { ApiError } from "../utils/api-error.js";

type RequestPart = "body" | "params";

const validateRequestPart = (
  part: RequestPart,
  schema: ZodType,
): RequestHandler => {
  return (request, _response, next): void => {
    const result = schema.safeParse(request[part]);

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

    if (part === "body") {
      request.body = result.data;
    } else {
      request.params = result.data as Record<string, string>;
    }

    next();
  };
};

export const validateBody = (schema: ZodType): RequestHandler =>
  validateRequestPart("body", schema);

export const validateParams = (schema: ZodType): RequestHandler =>
  validateRequestPart("params", schema);
