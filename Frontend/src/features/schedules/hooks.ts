import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createSchedule,
  fetchSchedules,
  updateSchedule,
  updateScheduleStatus,
} from './services/scheduleService'
import type { CreateScheduleInput, UpdateScheduleInput } from './types'

export const scheduleKeys = {
  all: ['doctor-schedules'] as const,
}

export function useSchedules() {
  return useQuery({
    queryKey: scheduleKeys.all,
    queryFn: fetchSchedules,
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateScheduleInput) => createSchedule(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

export function useUpdateSchedule(doctorId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateScheduleInput) =>
      updateSchedule(doctorId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

export function useUpdateScheduleStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      doctorId,
      isActive,
    }: {
      doctorId: string
      isActive: boolean
    }) => updateScheduleStatus(doctorId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}
