import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types'

import type {
  CreatePatientInput,
  Patient,
  PatientListFilters,
  PatientListResult,
  PatientPagination,
} from '../types'

export async function fetchPatients(
  filters: PatientListFilters,
): Promise<PatientListResult> {
  const { data } = await apiClient.get<ApiResponse<Patient[]>>('/patients', {
    params: {
      ...(filters.search ? { search: filters.search } : {}),
      page: String(filters.page),
      limit: String(filters.limit),
    },
  })

  return {
    patients: data.data,
    pagination: data.meta.pagination as PatientPagination,
  }
}

export async function fetchPatient(id: string): Promise<Patient> {
  const { data } = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`)
  return data.data
}

export async function createPatient(
  input: CreatePatientInput,
): Promise<Patient> {
  const { data } = await apiClient.post<ApiResponse<Patient>>(
    '/patients',
    input,
  )
  return data.data
}
