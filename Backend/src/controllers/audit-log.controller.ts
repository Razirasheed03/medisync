import type { Request, Response } from "express";

import type { AuditAction } from "../constants/audit-action.js";
import { listAuditLogs } from "../services/audit.service.js";
import { ApiResponse } from "../utils/api-response.js";

export const listAuditLogsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await listAuditLogs({
    ...(request.query.action
      ? { action: request.query.action as AuditAction }
      : {}),
    page: Number(request.query.page ?? 1),
    limit: Number(request.query.limit ?? 20),
  });

  response.status(200).json(
    new ApiResponse("Audit logs retrieved successfully", result.logs, {
      pagination: result.pagination,
    }),
  );
};
