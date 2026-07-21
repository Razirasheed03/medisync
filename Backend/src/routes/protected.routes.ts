import { Router } from "express";

import {
  adminDashboardController,
  doctorDashboardController,
  profileController,
  receptionDashboardController,
} from "../controllers/access.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { verifyJWT } from "../middlewares/verify-jwt.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const protectedRouter = Router();

protectedRouter.get(
  "/admin/dashboard",
  verifyJWT,
  authorize("SUPER_ADMIN"),
  asyncHandler(adminDashboardController),
);
protectedRouter.get(
  "/reception/dashboard",
  verifyJWT,
  authorize("RECEPTIONIST"),
  asyncHandler(receptionDashboardController),
);
protectedRouter.get(
  "/doctor/dashboard",
  verifyJWT,
  authorize("DOCTOR"),
  asyncHandler(doctorDashboardController),
);
protectedRouter.get("/profile", verifyJWT, asyncHandler(profileController));
