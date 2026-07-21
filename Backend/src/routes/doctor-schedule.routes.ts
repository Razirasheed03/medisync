import { Router } from "express";

import {
  createDoctorScheduleController,
  getDoctorScheduleController,
  listDoctorSchedulesController,
  updateDoctorScheduleController,
  updateDoctorScheduleStatusController,
} from "../controllers/doctor-schedule.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/verify-jwt.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createDoctorScheduleBodySchema,
  doctorIdParamsSchema,
  updateDoctorScheduleBodySchema,
  updateDoctorScheduleStatusBodySchema,
} from "../validators/doctor-schedule.validator.js";

export const doctorScheduleRouter = Router();

doctorScheduleRouter.use(verifyJWT);

doctorScheduleRouter.post(
  "/",
  authorize("SUPER_ADMIN"),
  validateBody(createDoctorScheduleBodySchema),
  asyncHandler(createDoctorScheduleController),
);
doctorScheduleRouter.get("/", asyncHandler(listDoctorSchedulesController));
doctorScheduleRouter.get(
  "/:doctorId",
  validateParams(doctorIdParamsSchema),
  asyncHandler(getDoctorScheduleController),
);
doctorScheduleRouter.put(
  "/:doctorId",
  authorize("SUPER_ADMIN"),
  validateParams(doctorIdParamsSchema),
  validateBody(updateDoctorScheduleBodySchema),
  asyncHandler(updateDoctorScheduleController),
);
doctorScheduleRouter.patch(
  "/:doctorId/status",
  authorize("SUPER_ADMIN"),
  validateParams(doctorIdParamsSchema),
  validateBody(updateDoctorScheduleStatusBodySchema),
  asyncHandler(updateDoctorScheduleStatusController),
);
