import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types'

import type { Department, Doctor, DoctorSlotsResult } from '../types'

export async function fetchDoctors(department?: Department): Promise<Doctor[]> {
  const { data } = await apiClient.get<ApiResponse<Doctor[]>>('/doctors', {
    params: {
      ...(department ? { department } : {}),
    },
  })
  return data.data
}

export async function fetchDoctorSlots(
  doctorId: string,
  date: string,
  duration?: number,
): Promise<DoctorSlotsResult> {
  const { data } = await apiClient.get<ApiResponse<DoctorSlotsResult>>(
    `/doctors/${doctorId}/slots`,
    {
      params: {
        date,
        ...(duration ? { duration: String(duration) } : {}),
      },
    },
  )
  return data.data
}
