import { randomUUID } from "node:crypto";

import { pinoHttp } from "pino-http";

import { logger } from "../lib/logger.js";

const getRequestUrl = (request: { url?: string | undefined }): string => {
  const originalUrl =
    "originalUrl" in request && typeof request.originalUrl === "string"
      ? request.originalUrl
      : undefined;

  return originalUrl ?? request.url ?? "";
};

export const requestLogger = pinoHttp({
  logger,
  quietResLogger: true,
  genReqId: (request, response) => {
    const incomingId = request.headers["x-request-id"];
    const requestId = typeof incomingId === "string" ? incomingId : randomUUID();

    response.setHeader("X-Request-Id", requestId);
    return requestId;
  },
  customSuccessObject: (request, response, value) => ({
    method: request.method,
    url: getRequestUrl(request),
    statusCode: response.statusCode,
    responseTime: value.responseTime,
  }),
  customSuccessMessage: (request, response, responseTime) =>
    `${request.method} ${getRequestUrl(request)} ${response.statusCode} ${responseTime}ms`,
  customErrorObject: (request, response, error, value) => ({
    method: request.method,
    url: getRequestUrl(request),
    statusCode: response.statusCode,
    responseTime: value.responseTime,
    err: error,
  }),
  customLogLevel: (_request, response, error) => {
    if (error || response.statusCode >= 500) return "error";
    if (response.statusCode >= 400) return "warn";
    return "info";
  },
});
