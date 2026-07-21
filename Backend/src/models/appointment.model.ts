import {
  Schema,
  model,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

import {
  APPOINTMENT_STATUSES,
  SLOT_HOLDING_STATUSES,
  type AppointmentStatus,
} from "../constants/appointment-status.js";
import { DEPARTMENTS, type Department } from "../constants/department.js";

export interface Appointment {
  patient: Types.ObjectId;
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  doctor: Types.ObjectId;
  department: Department;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  purpose?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentDocument = HydratedDocument<Appointment>;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const appointmentSchema = new Schema<Appointment, Model<Appointment>>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    patientEmail: {
      type: String,
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
    department: {
      type: String,
      enum: DEPARTMENTS,
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
    purpose: {
      type: String,
      trim: true,
      maxlength: 500,
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

appointmentSchema.index({ patientName: 1 });
appointmentSchema.index({ patientPhone: 1 });

// Named explicitly so the partial filter can evolve (e.g. new statuses)
// without colliding with a previously auto-named index in existing databases.
appointmentSchema.index(
  {
    doctor: 1,
    appointmentDate: 1,
    startTime: 1,
    endTime: 1,
  },
  {
    name: "unique_active_doctor_slot",
    unique: true,
    partialFilterExpression: {
      status: { $in: [...SLOT_HOLDING_STATUSES] },
    },
  },
);

export const AppointmentModel = model<Appointment>(
  "Appointment",
  appointmentSchema,
);
