import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types'
import type { UserRole } from '@/features/auth'

import type {
  AdminDashboard,
  DoctorDashboard,
  ReceptionDashboard,
} from '../types'

export type DashboardData =
  | AdminDashboard
  | ReceptionDashboard
  | DoctorDashboard

const dashboardPathByRole: Record<UserRole, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  RECEPTIONIST: '/reception/dashboard',
  DOCTOR: '/doctor/dashboard',
}

export async function fetchDashboard(
  role: UserRole,
): Promise<DashboardData> {
  const { data } = await apiClient.get<ApiResponse<DashboardData>>(
    dashboardPathByRole[role],
  )
  return data.data
}
