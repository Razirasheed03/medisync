import { Router } from "express";

import {
  createPatientController,
  getPatientController,
  listPatientsController,
} from "../controllers/patient.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/verify-jwt.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createPatientBodySchema,
  listPatientsQuerySchema,
  patientIdParamsSchema,
} from "../validators/patient.validator.js";

export const patientRouter = Router();

patientRouter.use(verifyJWT);

patientRouter.post(
  "/",
  authorize("SUPER_ADMIN", "RECEPTIONIST"),
  validateBody(createPatientBodySchema),
  asyncHandler(createPatientController),
);
patientRouter.get(
  "/",
  authorize("SUPER_ADMIN", "RECEPTIONIST"),
  validateQuery(listPatientsQuerySchema),
  asyncHandler(listPatientsController),
);
patientRouter.get(
  "/:id",
  validateParams(patientIdParamsSchema),
  asyncHandler(getPatientController),
);
