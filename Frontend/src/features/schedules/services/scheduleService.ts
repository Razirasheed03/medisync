import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types'

import type {
  CreateScheduleInput,
  DoctorSchedule,
  UpdateScheduleInput,
} from '../types'

export async function fetchSchedules(): Promise<DoctorSchedule[]> {
  const { data } =
    await apiClient.get<ApiResponse<DoctorSchedule[]>>('/doctor-schedules')
  return data.data
}

export async function fetchSchedule(
  doctorId: string,
): Promise<DoctorSchedule> {
  const { data } = await apiClient.get<ApiResponse<DoctorSchedule>>(
    `/doctor-schedules/${doctorId}`,
  )
  return data.data
}

export async function createSchedule(
  input: CreateScheduleInput,
): Promise<DoctorSchedule> {
  const { data } = await apiClient.post<ApiResponse<DoctorSchedule>>(
    '/doctor-schedules',
    input,
  )
  return data.data
}

export async function updateSchedule(
  doctorId: string,
  input: UpdateScheduleInput,
): Promise<DoctorSchedule> {
  const { data } = await apiClient.put<ApiResponse<DoctorSchedule>>(
    `/doctor-schedules/${doctorId}`,
    input,
  )
  return data.data
}

export async function updateScheduleStatus(
  doctorId: string,
  isActive: boolean,
): Promise<DoctorSchedule> {
  const { data } = await apiClient.patch<ApiResponse<DoctorSchedule>>(
    `/doctor-schedules/${doctorId}/status`,
    { isActive },
  )
  return data.data
}
