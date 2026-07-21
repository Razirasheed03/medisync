export const APPOINTMENT_STATUSES = [
  'BOOKED',
  'ARRIVED',
  'COMPLETED',
  'CANCELLED',
] as const

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

export const DEPARTMENTS = [
  'GENERAL_MEDICINE',
  'CARDIOLOGY',
  'DERMATOLOGY',
  'NEUROLOGY',
  'ORTHOPEDICS',
  'PEDIATRICS',
  'ENT',
  'OPHTHALMOLOGY',
] as const

export type Department = (typeof DEPARTMENTS)[number]

export const DEPARTMENT_LABELS: Record<Department, string> = {
  GENERAL_MEDICINE: 'General Medicine',
  CARDIOLOGY: 'Cardiology',
  DERMATOLOGY: 'Dermatology',
  NEUROLOGY: 'Neurology',
  ORTHOPEDICS: 'Orthopedics',
  PEDIATRICS: 'Pediatrics',
  ENT: 'ENT',
  OPHTHALMOLOGY: 'Ophthalmology',
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientEmail?: string
  patientPhone: string
  doctorId: string
  department: Department
  appointmentDate: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  purpose?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AppointmentPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AppointmentListFilters {
  search?: string
  doctorId?: string
  department?: Department
  date?: string
  dateFrom?: string
  dateTo?: string
  status?: AppointmentStatus
  page: number
  limit: number
  sortOrder: 'asc' | 'desc'
}

export interface AppointmentListResult {
  appointments: Appointment[]
  pagination: AppointmentPagination
}

/**
 * Booking accepts either an existing patient (`patientId`) or inline
 * new-patient details that auto-create a patient record on the backend.
 */
export interface CreateAppointmentInput {
  patientId?: string
  patientName?: string
  patientEmail?: string
  patientPhone?: string
  doctorId: string
  appointmentDate: string
  startTime: string
  endTime: string
  purpose?: string
  notes?: string
}

export interface UpdateAppointmentInput {
  doctorId?: string
  appointmentDate?: string
  startTime?: string
  endTime?: string
  status?: AppointmentStatus
  purpose?: string | null
  notes?: string | null
}

export interface Doctor {
  id: string
  name: string
  email: string
  department: Department
}

export interface DoctorSlot {
  startTime: string
  endTime: string
  isBooked: boolean
}

export interface DoctorSlotsResult {
  doctorId: string
  date: string
  duration: number
  slots: DoctorSlot[]
}
