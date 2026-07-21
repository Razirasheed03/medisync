import { Error as MongooseError } from "mongoose";
import type mongoose from "mongoose";

import type { Department } from "../constants/department.js";
import type { UserRole } from "../constants/user-role.js";
import type { UserStatus } from "../constants/user-status.js";
import {
  UserModel,
  type User,
  type UserDocument,
} from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import type {
  CreateUserBody,
  ResetUserPasswordBody,
  UpdateUserBody,
} from "../validators/user.validator.js";

const MANAGEABLE_ROLES = ["DOCTOR", "RECEPTIONIST"] as const;

export interface ManagedUserResponse {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Exclude<UserRole, "SUPER_ADMIN">;
  readonly status: UserStatus;
  readonly department?: Department;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ListUsersInput {
  readonly search?: string;
  readonly role?: Exclude<UserRole, "SUPER_ADMIN">;
  readonly status?: UserStatus;
  readonly page: number;
  readonly limit: number;
}

export interface UserPagination {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface ListUsersResult {
  readonly users: readonly ManagedUserResponse[];
  readonly pagination: UserPagination;
}

const toManagedUserResponse = (user: UserDocument): ManagedUserResponse => ({
  id: user.id as string,
  name: user.name,
  email: user.email,
  role: user.role as Exclude<UserRole, "SUPER_ADMIN">,
  status: user.status ?? "ACTIVE",
  ...(user.department !== undefined ? { department: user.department } : {}),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const isDuplicateKeyError = (error: unknown): error is { code: number } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000;

const throwPersistenceError = (error: unknown): never => {
  if (isDuplicateKeyError(error)) {
    throw new ApiError(409, "A user with this email already exists");
  }

  if (error instanceof MongooseError.ValidationError) {
    throw new ApiError(422, "User validation failed", {
      issues: Object.values(error.errors).map((validationError) => ({
        path: validationError.path,
        message: validationError.message,
      })),
    });
  }

  throw error;
};

const findManagedUserOrThrow = async (
  userId: string,
  includePassword = false,
): Promise<UserDocument> => {
  const query = UserModel.findOne({
    _id: userId,
    role: { $in: MANAGEABLE_ROLES },
  });
  const user = await (includePassword ? query.select("+password") : query);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const listUsers = async (
  input: ListUsersInput,
): Promise<ListUsersResult> => {
  const search = input.search
    ? new RegExp(escapeRegExp(input.search), "i")
    : undefined;
  const filter: mongoose.QueryFilter<User> = {
    role: input.role ?? { $in: [...MANAGEABLE_ROLES] },
    ...(input.status === "ACTIVE"
      ? { status: { $ne: "INACTIVE" as const } }
      : input.status
        ? { status: input.status }
        : {}),
    ...(search ? { $or: [{ name: search }, { email: search }] } : {}),
  };

  const skip = (input.page - 1) * input.limit;
  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(input.limit),
    UserModel.countDocuments(filter),
  ]);

  return {
    users: users.map(toManagedUserResponse),
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    },
  };
};

export const createUser = async (
  input: CreateUserBody,
): Promise<ManagedUserResponse> => {
  try {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      status: "ACTIVE",
      ...(input.department !== undefined
        ? { department: input.department }
        : {}),
    });
    return toManagedUserResponse(user);
  } catch (error) {
    return throwPersistenceError(error);
  }
};

export const getUser = async (userId: string): Promise<ManagedUserResponse> =>
  toManagedUserResponse(await findManagedUserOrThrow(userId));

export const updateUser = async (
  userId: string,
  input: UpdateUserBody,
): Promise<ManagedUserResponse> => {
  const user = await findManagedUserOrThrow(userId);

  user.set({
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.role !== undefined ? { role: input.role } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.department !== undefined
      ? { department: input.department }
      : {}),
    ...(input.status === "INACTIVE" ? { refreshToken: null } : {}),
  });

  try {
    await user.save();
    return toManagedUserResponse(user);
  } catch (error) {
    return throwPersistenceError(error);
  }
};

export const resetUserPassword = async (
  userId: string,
  input: ResetUserPasswordBody,
): Promise<void> => {
  const user = await findManagedUserOrThrow(userId, true);
  user.password = input.password;
  user.refreshToken = null;

  try {
    await user.save();
  } catch (error) {
    return throwPersistenceError(error);
  }
};

export const deactivateUser = async (
  userId: string,
  authenticatedUserId: string,
): Promise<ManagedUserResponse> => {
  if (userId === authenticatedUserId) {
    throw new ApiError(409, "You cannot deactivate your own account");
  }

  const user = await findManagedUserOrThrow(userId);
  user.status = "INACTIVE";
  user.refreshToken = null;
  await user.save();
  return toManagedUserResponse(user);
};
