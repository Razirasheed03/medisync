import type { Request, Response } from "express";

import { REFRESH_TOKEN_COOKIE } from "../constants/auth.js";
import {
  login,
  logout,
  refresh,
  type AuthenticationResult,
} from "../services/auth.service.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  clearRefreshTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/auth-cookie.js";
import type { LoginBody } from "../validators/auth.validator.js";

const readRefreshTokenCookie = (request: Request): string | undefined => {
  const value: unknown = request.cookies?.[REFRESH_TOKEN_COOKIE];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

const sendAuthenticationResponse = (
  response: Response,
  message: string,
  result: AuthenticationResult,
): void => {
  response.cookie(
    REFRESH_TOKEN_COOKIE,
    result.refreshToken,
    refreshTokenCookieOptions,
  );
  response.status(200).json(
    new ApiResponse(message, {
      accessToken: result.accessToken,
      user: result.user,
    }),
  );
};

export const loginController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const credentials = request.body as LoginBody;
  sendAuthenticationResponse(response, "Login successful", await login(credentials));
};

export const refreshController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const refreshToken = readRefreshTokenCookie(request);

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  sendAuthenticationResponse(
    response,
    "Token refreshed successfully",
    await refresh(refreshToken),
  );
};

export const logoutController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await logout(readRefreshTokenCookie(request));
  response.clearCookie(REFRESH_TOKEN_COOKIE, clearRefreshTokenCookieOptions);
  response.status(200).json(new ApiResponse("Logout successful", null));
};
