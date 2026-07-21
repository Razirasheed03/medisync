import { Error as MongooseError } from "mongoose";
import type mongoose from "mongoose";

import { getNextSequence } from "../models/counter.model.js";
import {
  PatientModel,
  type Patient,
  type PatientDocument,
} from "../models/patient.model.js";
import { ApiError } from "../utils/api-error.js";
import type { CreatePatientBody } from "../validators/patient.validator.js";

export interface PatientResponse {
  readonly id: string;
  readonly patientCode: string;
  readonly name: string;
  readonly phone: string;
  readonly email?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ListPatientsInput {
  readonly search?: string;
  readonly page: number;
  readonly limit: number;
}

export interface PatientPagination {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface ListPatientsResult {
  readonly patients: readonly PatientResponse[];
  readonly pagination: PatientPagination;
}

const toPatientResponse = (patient: PatientDocument): PatientResponse => ({
  id: patient.id as string,
  patientCode: patient.patientCode,
  name: patient.name,
  phone: patient.phone,
  ...(patient.email !== undefined ? { email: patient.email } : {}),
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
});

const throwPersistenceError = (error: unknown): never => {
  if (error instanceof MongooseError.ValidationError) {
    throw new ApiError(422, "Patient validation failed", {
      issues: Object.values(error.errors).map((validationError) => ({
        path: validationError.path,
        message: validationError.message,
      })),
    });
  }

  throw error;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const generatePatientCode = async (): Promise<string> => {
  const sequence = await getNextSequence("patientCode");
  return `PAT-${sequence.toString().padStart(6, "0")}`;
};

export const createPatient = async (
  input: CreatePatientBody,
): Promise<PatientResponse> => {
  try {
    const patient = await PatientModel.create({
      patientCode: await generatePatientCode(),
      name: input.name,
      phone: input.phone,
      ...(input.email !== undefined ? { email: input.email } : {}),
    });
    return toPatientResponse(patient);
  } catch (error) {
    return throwPersistenceError(error);
  }
};

export const listPatients = async (
  input: ListPatientsInput,
): Promise<ListPatientsResult> => {
  const search = input.search
    ? new RegExp(escapeRegExp(input.search), "i")
    : undefined;
  const filter: mongoose.QueryFilter<Patient> = {
    ...(search
      ? { $or: [{ patientCode: search }, { name: search }, { phone: search }] }
      : {}),
  };

  const skip = (input.page - 1) * input.limit;
  const [patients, total] = await Promise.all([
    PatientModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(input.limit),
    PatientModel.countDocuments(filter),
  ]);

  return {
    patients: patients.map(toPatientResponse),
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    },
  };
};

export const getPatient = async (
  patientId: string,
): Promise<PatientResponse> => {
  const patient = await PatientModel.findById(patientId);

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return toPatientResponse(patient);
};

/** Returns the patient document referenced during appointment booking. */
export const findPatientDocumentOrThrow = async (
  patientId: string,
): Promise<PatientDocument> => {
  const patient = await PatientModel.findById(patientId);

  if (!patient) {
    throw new ApiError(422, "patientId must reference an existing patient");
  }

  return patient;
};
