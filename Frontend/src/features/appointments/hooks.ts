import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  cancelAppointment,
  createAppointment,
  fetchAppointment,
  fetchAppointments,
  markAppointmentArrived,
  updateAppointment,
} from './services/appointmentService'
import { fetchDoctors, fetchDoctorSlots } from './services/doctorService'
import type {
  AppointmentListFilters,
  CreateAppointmentInput,
  Department,
  UpdateAppointmentInput,
} from './types'

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: AppointmentListFilters) =>
    [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
}

export const doctorKeys = {
  all: ['doctors'] as const,
  list: (department?: Department) =>
    [...doctorKeys.all, department ?? 'all'] as const,
  slots: (doctorId: string, date: string) =>
    [...doctorKeys.all, doctorId, 'slots', date] as const,
}

export function useAppointments(filters: AppointmentListFilters) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => fetchAppointments(filters),
    placeholderData: keepPreviousData,
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => fetchAppointment(id),
  })
}

export function useDoctors(department?: Department) {
  return useQuery({
    queryKey: doctorKeys.list(department),
    queryFn: () => fetchDoctors(department),
    staleTime: 5 * 60_000,
  })
}

export function useDoctorSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: doctorKeys.slots(doctorId, date),
    queryFn: () => fetchDoctorSlots(doctorId, date),
    enabled: Boolean(doctorId && date),
    staleTime: 0,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => createAppointment(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
    },
  })
}

export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateAppointmentInput) => updateAppointment(id, input),
    onSuccess: (appointment) => {
      queryClient.setQueryData(appointmentKeys.detail(id), appointment)
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
    },
  })
}

export function useMarkAppointmentArrived(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markAppointmentArrived(id),
    onSuccess: (appointment) => {
      queryClient.setQueryData(appointmentKeys.detail(id), appointment)
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
    },
  })
}

export function useCancelAppointment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => cancelAppointment(id),
    onSuccess: (appointment) => {
      queryClient.setQueryData(appointmentKeys.detail(id), appointment)
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
    },
  })
}
