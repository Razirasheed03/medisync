import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createPatient,
  fetchPatient,
  fetchPatients,
} from './services/patientService'
import type { CreatePatientInput, PatientListFilters } from './types'

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: PatientListFilters) =>
    [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
}

export function usePatients(filters: PatientListFilters, enabled = true) {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => fetchPatients(filters),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => fetchPatient(id),
    enabled: Boolean(id),
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePatientInput) => createPatient(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}
