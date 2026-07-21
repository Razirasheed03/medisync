import type { Request, Response } from "express";

import type { UserRole } from "../constants/user-role.js";
import type { UserStatus } from "../constants/user-status.js";
import {
  createUser,
  deactivateUser,
  getUser,
  listUsers,
  resetUserPassword,
  updateUser,
} from "../services/user.service.js";
import { ApiResponse } from "../utils/api-response.js";
import type {
  CreateUserBody,
  ResetUserPasswordBody,
  UpdateUserBody,
} from "../validators/user.validator.js";

export const listUsersController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await listUsers({
    ...(request.query.search
      ? { search: request.query.search as string }
      : {}),
    ...(request.query.role
      ? {
          role: request.query.role as Exclude<UserRole, "SUPER_ADMIN">,
        }
      : {}),
    ...(request.query.status
      ? { status: request.query.status as UserStatus }
      : {}),
    page: Number(request.query.page ?? 1),
    limit: Number(request.query.limit ?? 20),
  });

  response.status(200).json(
    new ApiResponse("Users retrieved successfully", result.users, {
      pagination: result.pagination,
    }),
  );
};

export const createUserController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = await createUser(request.body as CreateUserBody);
  response
    .status(201)
    .json(new ApiResponse("User created successfully", user));
};

export const getUserController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json(
    new ApiResponse(
      "User retrieved successfully",
      await getUser(request.params.id as string),
    ),
  );
};

export const updateUserController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = await updateUser(
    request.params.id as string,
    request.body as UpdateUserBody,
  );
  response
    .status(200)
    .json(new ApiResponse("User updated successfully", user));
};

export const resetUserPasswordController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await resetUserPassword(
    request.params.id as string,
    request.body as ResetUserPasswordBody,
  );
  response
    .status(200)
    .json(new ApiResponse("User password reset successfully", null));
};

export const deactivateUserController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = await deactivateUser(
    request.params.id as string,
    request.user?.id ?? "",
  );
  response
    .status(200)
    .json(new ApiResponse("User deactivated successfully", user));
};
