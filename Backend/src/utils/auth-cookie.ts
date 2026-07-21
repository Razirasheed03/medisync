import type { CookieOptions } from "express";

import { env } from "../config/env.js";

export const refreshTokenCookieOptions: CookieOptions = Object.freeze({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/v1/auth",
  maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000,
});

export const clearRefreshTokenCookieOptions: CookieOptions = Object.freeze({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/v1/auth",
});
