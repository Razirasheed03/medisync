import { Router } from "express";

import { getDoctorSlotsController } from "../controllers/doctor-slot.controller.js";
import { listDoctorsController } from "../controllers/doctor.controller.js";
import {
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/verify-jwt.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { doctorIdParamsSchema } from "../validators/doctor-schedule.validator.js";
import { doctorSlotsQuerySchema } from "../validators/doctor-slot.validator.js";
import { listDoctorsQuerySchema } from "../validators/doctor.validator.js";

export const doctorRouter = Router();

doctorRouter.use(verifyJWT);

doctorRouter.get(
  "/",
  validateQuery(listDoctorsQuerySchema),
  asyncHandler(listDoctorsController),
);
doctorRouter.get(
  "/:doctorId/slots",
  validateParams(doctorIdParamsSchema),
  validateQuery(doctorSlotsQuerySchema),
  asyncHandler(getDoctorSlotsController),
);

