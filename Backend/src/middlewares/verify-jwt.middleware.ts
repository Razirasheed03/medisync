import type { RequestHandler } from "express";

import { UserModel } from "../models/user.model.js";
import { verifyAccessToken } from "../services/auth.service.js";
import { ApiError } from "../utils/api-error.js";

export const verifyJWT: RequestHandler = async (request, _response, next) => {
  const authorization = request.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    next(new ApiError(401, "Access token is required"));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    next(new ApiError(401, "Access token is required"));
    return;
  }

  try {
    const authenticatedUser = verifyAccessToken(token);
    const activeUser = await UserModel.findOne({
      _id: authenticatedUser.id,
      status: { $ne: "INACTIVE" },
    }).select("role name");

    if (!activeUser || activeUser.role !== authenticatedUser.role) {
      throw new ApiError(401, "User account is inactive or unavailable");
    }

    request.user = { ...authenticatedUser, name: activeUser.name };
    next();
  } catch (error) {
    next(error);
  }
};
