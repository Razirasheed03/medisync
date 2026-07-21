import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types'

import type {
  CreateUserInput,
  ManagedUser,
  UpdateUserInput,
  UserListFilters,
  UserListResult,
  UserPagination,
} from '../types'

export async function fetchUsers(
  filters: UserListFilters,
): Promise<UserListResult> {
  const { data } = await apiClient.get<ApiResponse<ManagedUser[]>>('/users', {
    params: {
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      page: String(filters.page),
      limit: String(filters.limit),
    },
  })

  return {
    users: data.data,
    pagination: data.meta.pagination as UserPagination,
  }
}

export async function fetchUser(id: string): Promise<ManagedUser> {
  const { data } = await apiClient.get<ApiResponse<ManagedUser>>(`/users/${id}`)
  return data.data
}

export async function createUser(
  input: CreateUserInput,
): Promise<ManagedUser> {
  const { data } = await apiClient.post<ApiResponse<ManagedUser>>('/users', input)
  return data.data
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<ManagedUser> {
  const { data } = await apiClient.patch<ApiResponse<ManagedUser>>(
    `/users/${id}`,
    input,
  )
  return data.data
}

export async function resetUserPassword(
  id: string,
  password: string,
): Promise<void> {
  await apiClient.patch(`/users/${id}/password`, { password })
}

export async function deactivateUser(id: string): Promise<ManagedUser> {
  const { data } = await apiClient.delete<ApiResponse<ManagedUser>>(
    `/users/${id}`,
  )
  return data.data
}

export async function activateUser(id: string): Promise<ManagedUser> {
  const { data } = await apiClient.patch<ApiResponse<ManagedUser>>(
    `/users/${id}`,
    { status: 'ACTIVE' },
  )
  return data.data
}
