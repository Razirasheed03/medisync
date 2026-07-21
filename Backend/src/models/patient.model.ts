import {
  Schema,
  model,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface Patient {
  patientCode: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PatientDocument = HydratedDocument<Patient>;

const patientSchema = new Schema<Patient, Model<Patient>>(
  {
    patientCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const PatientModel = model<Patient>("Patient", patientSchema);
