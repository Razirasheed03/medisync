import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  activateUser,
  createUser,
  deactivateUser,
  fetchUser,
  fetchUsers,
  resetUserPassword,
  updateUser,
} from './services/userService'
import type {
  CreateUserInput,
  UpdateUserInput,
  UserListFilters,
} from './types'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserListFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

export function useUsers(filters: UserListFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    placeholderData: keepPreviousData,
  })
}

export function useManagedUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateUser(id, input),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(id), user)
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useResetUserPassword(id: string) {
  return useMutation({
    mutationFn: (password: string) => resetUserPassword(id, password),
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user)
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => activateUser(id),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user)
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
