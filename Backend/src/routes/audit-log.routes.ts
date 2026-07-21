import { Router } from "express";

import { listAuditLogsController } from "../controllers/audit-log.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateQuery } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/verify-jwt.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { listAuditLogsQuerySchema } from "../validators/audit-log.validator.js";

export const auditLogRouter = Router();

auditLogRouter.use(verifyJWT, authorize("SUPER_ADMIN"));

auditLogRouter.get(
  "/",
  validateQuery(listAuditLogsQuerySchema),
  asyncHandler(listAuditLogsController),
);
