import { Router } from "express";

import { getDoctorSlotsController } from "../controllers/doctor-slot.controller.js";
import {
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/verify-jwt.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { doctorIdParamsSchema } from "../validators/doctor-schedule.validator.js";
import { doctorSlotsQuerySchema } from "../validators/doctor-slot.validator.js";

export const doctorRouter = Router();

doctorRouter.use(verifyJWT);

doctorRouter.get(
  "/:doctorId/slots",
  validateParams(doctorIdParamsSchema),
  validateQuery(doctorSlotsQuerySchema),
  asyncHandler(getDoctorSlotsController),
);

