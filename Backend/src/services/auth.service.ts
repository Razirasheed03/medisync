import { createHash, randomUUID } from "node:crypto";

import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";
import { JWT_AUDIENCE, JWT_ISSUER } from "../constants/auth.js";
import { USER_ROLES, type UserRole } from "../constants/user-role.js";
import { UserModel, type UserDocument } from "../models/user.model.js";
import type {
  AccessTokenPayload,
  AuthenticatedUser,
  RefreshTokenPayload,
} from "../types/auth.js";
import { ApiError } from "../utils/api-error.js";
import type { LoginBody } from "../validators/auth.validator.js";
import { recordAuditEvent } from "./audit.service.js";

export interface PublicUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface AuthenticationResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: PublicUser;
}

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && USER_ROLES.includes(value as UserRole);

const hashRefreshToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const toPublicUser = (user: UserDocument): PublicUser => ({
  id: user.id as string,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createTokenPair = (
  userId: string,
  role: UserRole,
): Pick<AuthenticationResult, "accessToken" | "refreshToken"> => {
  const accessToken = jwt.sign(
    { role, type: "access" },
    env.ACCESS_TOKEN_SECRET,
    {
      algorithm: "HS256",
      audience: JWT_AUDIENCE,
      expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
      issuer: JWT_ISSUER,
      subject: userId,
    },
  );

  const refreshToken = jwt.sign(
    { type: "refresh" },
    env.REFRESH_TOKEN_SECRET,
    {
      algorithm: "HS256",
      audience: JWT_AUDIENCE,
      expiresIn: env.REFRESH_TOKEN_TTL_SECONDS,
      issuer: JWT_ISSUER,
      jwtid: randomUUID(),
      subject: userId,
    },
  );

  return { accessToken, refreshToken };
};

const verifyToken = (
  token: string,
  secret: string,
  expectedType: "access" | "refresh",
): JwtPayload => {
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      payload.type !== expectedType
    ) {
      throw new ApiError(401, "Invalid authentication token");
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid or expired authentication token");
  }
};

export const login = async (credentials: LoginBody): Promise<AuthenticationResult> => {
  const user = await UserModel.findOne({
    email: credentials.email,
    status: { $ne: "INACTIVE" },
  }).select("+password");

  if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = createTokenPair(user.id as string, user.role);
  await UserModel.updateOne(
    { _id: user._id },
    { $set: { refreshToken: hashRefreshToken(tokens.refreshToken) } },
  );

  await recordAuditEvent({
    actor: { id: user.id as string, name: user.name, role: user.role },
    action: "LOGIN",
    entityType: "User",
    entityId: user.id as string,
  });

  return {
    ...tokens,
    user: toPublicUser(user),
  };
};

export const refresh = async (refreshToken: string): Promise<AuthenticationResult> => {
  const payload = verifyToken(
    refreshToken,
    env.REFRESH_TOKEN_SECRET,
    "refresh",
  ) as JwtPayload & RefreshTokenPayload;
  const currentTokenHash = hashRefreshToken(refreshToken);
  const user = await UserModel.findOne({
    _id: payload.sub,
    refreshToken: currentTokenHash,
    status: { $ne: "INACTIVE" },
  });

  if (!user) {
    throw new ApiError(401, "Refresh token is no longer valid");
  }

  const tokens = createTokenPair(user.id as string, user.role);
  const result = await UserModel.updateOne(
    { _id: user._id, refreshToken: currentTokenHash },
    { $set: { refreshToken: hashRefreshToken(tokens.refreshToken) } },
  );

  if (result.modifiedCount !== 1) {
    throw new ApiError(401, "Refresh token is no longer valid");
  }

  return {
    ...tokens,
    user: toPublicUser(user),
  };
};

export const logout = async (refreshToken: string | undefined): Promise<void> => {
  if (!refreshToken) return;

  await UserModel.updateOne(
    { refreshToken: hashRefreshToken(refreshToken) },
    { $set: { refreshToken: null } },
  );
};

export const verifyAccessToken = (token: string): AuthenticatedUser => {
  const payload = verifyToken(
    token,
    env.ACCESS_TOKEN_SECRET,
    "access",
  ) as JwtPayload & AccessTokenPayload;

  if (!isUserRole(payload.role)) {
    throw new ApiError(401, "Invalid authentication token");
  }

  return {
    id: payload.sub,
    role: payload.role,
  };
};
