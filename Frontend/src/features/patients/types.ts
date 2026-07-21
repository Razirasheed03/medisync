export interface Patient {
  id: string
  patientCode: string
  name: string
  phone: string
  email?: string
  createdAt: string
  updatedAt: string
}

export interface PatientPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PatientListFilters {
  search?: string
  page: number
  limit: number
}

export interface PatientListResult {
  patients: Patient[]
  pagination: PatientPagination
}

export interface CreatePatientInput {
  name: string
  phone: string
  email?: string
}
