import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types'

import type {
  Appointment,
  AppointmentListFilters,
  AppointmentListResult,
  AppointmentPagination,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../types'

export async function fetchAppointments(
  filters: AppointmentListFilters,
): Promise<AppointmentListResult> {
  const { data } = await apiClient.get<ApiResponse<Appointment[]>>(
    '/appointments',
    {
      params: {
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.doctorId ? { doctorId: filters.doctorId } : {}),
        ...(filters.department ? { department: filters.department } : {}),
        ...(filters.date ? { date: filters.date } : {}),
        ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
        ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        page: String(filters.page),
        limit: String(filters.limit),
        sortOrder: filters.sortOrder,
      },
    },
  )

  return {
    appointments: data.data,
    pagination: data.meta.pagination as AppointmentPagination,
  }
}

export async function fetchAppointment(id: string): Promise<Appointment> {
  const { data } = await apiClient.get<ApiResponse<Appointment>>(
    `/appointments/${id}`,
  )
  return data.data
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<Appointment> {
  const { data } = await apiClient.post<ApiResponse<Appointment>>(
    '/appointments',
    input,
  )
  return data.data
}

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput,
): Promise<Appointment> {
  const { data } = await apiClient.patch<ApiResponse<Appointment>>(
    `/appointments/${id}`,
    input,
  )
  return data.data
}

export async function markAppointmentArrived(
  id: string,
): Promise<Appointment> {
  const { data } = await apiClient.patch<ApiResponse<Appointment>>(
    `/appointments/${id}/arrive`,
    {},
  )
  return data.data
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const { data } = await apiClient.patch<ApiResponse<Appointment>>(
    `/appointments/${id}/cancel`,
    {},
  )
  return data.data
}
