import type { Request, Response } from "express";

import {
  createPatient,
  getPatient,
  listPatients,
} from "../services/patient.service.js";
import { ApiResponse } from "../utils/api-response.js";
import type { CreatePatientBody } from "../validators/patient.validator.js";

export const createPatientController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const patient = await createPatient(request.body as CreatePatientBody);
  response
    .status(201)
    .json(new ApiResponse("Patient created successfully", patient));
};

export const listPatientsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await listPatients({
    ...(request.query.search
      ? { search: request.query.search as string }
      : {}),
    page: Number(request.query.page ?? 1),
    limit: Number(request.query.limit ?? 20),
  });

  response.status(200).json(
    new ApiResponse("Patients retrieved successfully", result.patients, {
      pagination: result.pagination,
    }),
  );
};

export const getPatientController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json(
    new ApiResponse(
      "Patient retrieved successfully",
      await getPatient(request.params.id as string),
    ),
  );
};
