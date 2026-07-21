import { Router } from "express";

import {
  loginController,
  logoutController,
  refreshController,
} from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  emptyBodySchema,
  loginBodySchema,
} from "../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginBodySchema), asyncHandler(loginController));
authRouter.post(
  "/refresh",
  validateBody(emptyBodySchema),
  asyncHandler(refreshController),
);
authRouter.post(
  "/logout",
  validateBody(emptyBodySchema),
  asyncHandler(logoutController),
);
