import { AppointmentModel } from "../models/appointment.model.js";
import { DoctorScheduleModel } from "../models/doctor-schedule.model.js";
import { PatientModel } from "../models/patient.model.js";
import { UserModel } from "../models/user.model.js";

export interface AdminDashboard {
  readonly doctors: number;
  readonly receptionists: number;
  readonly patients: number;
  readonly activeSchedules: number;
  readonly appointmentsToday: number;
  readonly upcomingAppointments: number;
}

export interface ReceptionDashboard {
  readonly patients: number;
  readonly appointmentsToday: number;
  readonly bookedToday: number;
  readonly arrivedToday: number;
  readonly completedToday: number;
}

export interface DoctorDashboard {
  readonly appointmentsToday: number;
  readonly arrivedToday: number;
  readonly completedToday: number;
  readonly upcomingAppointments: number;
}

const getLocalToday = (now = new Date()): string => {
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getAdminDashboard = async (): Promise<AdminDashboard> => {
  const today = getLocalToday();
  const [
    doctors,
    receptionists,
    patients,
    activeSchedules,
    appointmentsToday,
    upcomingAppointments,
  ] = await Promise.all([
    UserModel.countDocuments({ role: "DOCTOR", status: { $ne: "INACTIVE" } }),
    UserModel.countDocuments({
      role: "RECEPTIONIST",
      status: { $ne: "INACTIVE" },
    }),
    PatientModel.estimatedDocumentCount(),
    DoctorScheduleModel.countDocuments({ isActive: true }),
    AppointmentModel.countDocuments({
      appointmentDate: today,
      status: { $ne: "CANCELLED" },
    }),
    AppointmentModel.countDocuments({
      appointmentDate: { $gte: today },
      status: { $in: ["BOOKED", "ARRIVED"] },
    }),
  ]);

  return {
    doctors,
    receptionists,
    patients,
    activeSchedules,
    appointmentsToday,
    upcomingAppointments,
  };
};

export const getReceptionDashboard = async (): Promise<ReceptionDashboard> => {
  const today = getLocalToday();
  const [patients, appointmentsToday, bookedToday, arrivedToday, completedToday] =
    await Promise.all([
      PatientModel.estimatedDocumentCount(),
      AppointmentModel.countDocuments({
        appointmentDate: today,
        status: { $ne: "CANCELLED" },
      }),
      AppointmentModel.countDocuments({
        appointmentDate: today,
        status: "BOOKED",
      }),
      AppointmentModel.countDocuments({
        appointmentDate: today,
        status: "ARRIVED",
      }),
      AppointmentModel.countDocuments({
        appointmentDate: today,
        status: "COMPLETED",
      }),
    ]);

  return {
    patients,
    appointmentsToday,
    bookedToday,
    arrivedToday,
    completedToday,
  };
};

export const getDoctorDashboard = async (
  doctorId: string,
): Promise<DoctorDashboard> => {
  const today = getLocalToday();
  const [appointmentsToday, arrivedToday, completedToday, upcomingAppointments] =
    await Promise.all([
      AppointmentModel.countDocuments({
        doctor: doctorId,
        appointmentDate: today,
        status: { $ne: "CANCELLED" },
      }),
      AppointmentModel.countDocuments({
        doctor: doctorId,
        appointmentDate: today,
        status: "ARRIVED",
      }),
      AppointmentModel.countDocuments({
        doctor: doctorId,
        appointmentDate: today,
        status: "COMPLETED",
      }),
      AppointmentModel.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: today },
        status: { $in: ["BOOKED", "ARRIVED"] },
      }),
    ]);

  return {
    appointmentsToday,
    arrivedToday,
    completedToday,
    upcomingAppointments,
  };
};
