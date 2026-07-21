import { Router } from "express";

import { DEPARTMENTS } from "../constants/department.js";
import { verifyJWT } from "../middlewares/verify-jwt.middleware.js";
import { ApiResponse } from "../utils/api-response.js";

export const departmentRouter = Router();

departmentRouter.get("/", verifyJWT, (_request, response) => {
  response
    .status(200)
    .json(new ApiResponse("Departments retrieved successfully", DEPARTMENTS));
});
