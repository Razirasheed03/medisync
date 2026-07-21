import { Router } from "express";

import {
  cancelAppointmentController,
  createAppointmentController,
  getAppointmentController,
  listAppointmentsController,
  markAppointmentArrivedController,
  updateAppointmentController,
} from "../controllers/appointment.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/verify-jwt.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  appointmentIdParamsSchema,
  createAppointmentBodySchema,
  listAppointmentsQuerySchema,
  updateAppointmentBodySchema,
} from "../validators/appointment.validator.js";

export const appointmentRouter = Router();

appointmentRouter.use(verifyJWT);

appointmentRouter.post(
  "/",
  authorize("SUPER_ADMIN", "RECEPTIONIST"),
  validateBody(createAppointmentBodySchema),
  asyncHandler(createAppointmentController),
);
appointmentRouter.get(
  "/",
  validateQuery(listAppointmentsQuerySchema),
  asyncHandler(listAppointmentsController),
);
appointmentRouter.get(
  "/:id",
  validateParams(appointmentIdParamsSchema),
  asyncHandler(getAppointmentController),
);
appointmentRouter.patch(
  "/:id",
  validateParams(appointmentIdParamsSchema),
  validateBody(updateAppointmentBodySchema),
  asyncHandler(updateAppointmentController),
);
appointmentRouter.patch(
  "/:id/arrive",
  authorize("SUPER_ADMIN", "RECEPTIONIST"),
  validateParams(appointmentIdParamsSchema),
  asyncHandler(markAppointmentArrivedController),
);
appointmentRouter.patch(
  "/:id/cancel",
  authorize("SUPER_ADMIN", "RECEPTIONIST"),
  validateParams(appointmentIdParamsSchema),
  asyncHandler(cancelAppointmentController),
);
