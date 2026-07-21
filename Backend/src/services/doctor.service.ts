import type { Department } from "../constants/department.js";
import { UserModel } from "../models/user.model.js";

export interface DoctorResponse {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly department: Department;
}

export const listDoctors = async (
  department?: Department,
): Promise<readonly DoctorResponse[]> => {
  const doctors = await UserModel.find({
    role: "DOCTOR",
    status: { $ne: "INACTIVE" },
    ...(department ? { department } : {}),
  }).sort({ name: 1 });

  return doctors.map((doctor) => ({
    id: doctor.id as string,
    name: doctor.name,
    email: doctor.email,
    department: doctor.department ?? "GENERAL_MEDICINE",
  }));
};
