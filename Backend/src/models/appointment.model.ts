import {
  Schema,
  model,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from "../constants/appointment-status.js";

export interface Appointment {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctor: Types.ObjectId;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentDocument = HydratedDocument<Appointment>;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const appointmentSchema = new Schema<Appointment, Model<Appointment>>(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    patientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    patientPhone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    appointmentDate: {
      type: String,
      required: true,
      match: datePattern,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: timePattern,
    },
    endTime: {
      type: String,
      required: true,
      match: timePattern,
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: "BOOKED",
      required: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

appointmentSchema.index({
  appointmentDate: 1,
  startTime: 1,
  endTime: 1,
});

appointmentSchema.index(
  {
    doctor: 1,
    appointmentDate: 1,
    startTime: 1,
    endTime: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["BOOKED", "COMPLETED"] },
    },
  },
);

export const AppointmentModel = model<Appointment>(
  "Appointment",
  appointmentSchema,
);
