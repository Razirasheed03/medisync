import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  type Department,
} from '@/features/appointments'

export { DEPARTMENTS, DEPARTMENT_LABELS }
export type { Department }

export const MANAGED_USER_ROLES = ['DOCTOR', 'RECEPTIONIST'] as const
export const USER_STATUSES = ['ACTIVE', 'INACTIVE'] as const

export type ManagedUserRole = (typeof MANAGED_USER_ROLES)[number]
export type UserStatus = (typeof USER_STATUSES)[number]

export interface ManagedUser {
  id: string
  name: string
  email: string
  role: ManagedUserRole
  status: UserStatus
  department?: Department
  createdAt: string
  updatedAt: string
}

export interface UserPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UserListFilters {
  search?: string
  role?: ManagedUserRole
  status?: UserStatus
  page: number
  limit: number
}

export interface UserListResult {
  users: ManagedUser[]
  pagination: UserPagination
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: ManagedUserRole
  department?: Department
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: ManagedUserRole
  status?: UserStatus
  department?: Department
}
