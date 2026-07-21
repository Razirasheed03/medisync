import { Router } from "express";

import {
  createUserController,
  deactivateUserController,
  getUserController,
  listUsersController,
  resetUserPasswordController,
  updateUserController,
} from "../controllers/user.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/verify-jwt.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createUserBodySchema,
  listUsersQuerySchema,
  resetUserPasswordBodySchema,
  updateUserBodySchema,
  userIdParamsSchema,
} from "../validators/user.validator.js";

export const userRouter = Router();

userRouter.use(verifyJWT, authorize("SUPER_ADMIN"));

userRouter.get(
  "/",
  validateQuery(listUsersQuerySchema),
  asyncHandler(listUsersController),
);
userRouter.post(
  "/",
  validateBody(createUserBodySchema),
  asyncHandler(createUserController),
);
userRouter.get(
  "/:id",
  validateParams(userIdParamsSchema),
  asyncHandler(getUserController),
);
userRouter.patch(
  "/:id",
  validateParams(userIdParamsSchema),
  validateBody(updateUserBodySchema),
  asyncHandler(updateUserController),
);
userRouter.patch(
  "/:id/password",
  validateParams(userIdParamsSchema),
  validateBody(resetUserPasswordBodySchema),
  asyncHandler(resetUserPasswordController),
);
userRouter.delete(
  "/:id",
  validateParams(userIdParamsSchema),
  asyncHandler(deactivateUserController),
);
