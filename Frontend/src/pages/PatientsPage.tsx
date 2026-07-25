import { useEffect, useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingBlock,
  PageHeader,
  Spinner,
} from '@/components/ui'
import {
  PatientForm,
  useCreatePatient,
  usePatients,
  type PatientListFilters,
} from '@/features/patients'
import { useDebouncedValue } from '@/hooks'
import { useAuth } from '@/store'
import { useToast } from '@/providers/toast'

const initialFilters: PatientListFilters = {
  page: 1,
  limit: 10,
}

export function PatientsPage() {
  const { user } = useAuth()
  const canCreate =
    user?.role === 'SUPER_ADMIN' || user?.role === 'RECEPTIONIST'
  const { showToast } = useToast()

  const [filters, setFilters] = useState<PatientListFilters>(initialFilters)
  const [searchInput, setSearchInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350)
  useEffect(() => {
    setFilters((current) => {
      const search = debouncedSearch || undefined
      if ((current.search ?? undefined) === search) return current
      return { ...current, search, page: 1 }
    })
  }, [debouncedSearch])

  const patientsQuery = usePatients(filters)
  const createMutation = useCreatePatient()

  if (isCreating) {
    return (
      <>
        <PageHeader
          title="Register Patient"
          description="Create a new patient record."
        />
        <Card>
          <PatientForm
            submitLabel="Create patient"
            onCancel={() => setIsCreating(false)}
            onSubmit={async (input) => {
              await createMutation.mutateAsync(input)
              showToast('Patient created', 'success')
              setIsCreating(false)
            }}
          />
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Patients"
        description="Browse and manage patient records."
        actions={
          canCreate ? (
            <Button onClick={() => setIsCreating(true)}>New patient</Button>
          ) : undefined
        }
      />

      <Card className="p-4 sm:p-5">
        <div className="relative">
          <Input
            label="Search"
            type="search"
            placeholder="Patient ID, mobile number, or name…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          {patientsQuery.isFetching && filters.search ? (
            <Spinner className="absolute right-3 top-9 size-4" />
          ) : null}
        </div>
      </Card>

      {patientsQuery.isPending ? (
        <LoadingBlock label="Loading patients…" variant="table" count={5} />
      ) : patientsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(patientsQuery.error)}
          onRetry={() => void patientsQuery.refetch()}
        />
      ) : patientsQuery.data.patients.length === 0 ? (
        <EmptyState
          title="No patients found"
          description={
            filters.search
              ? 'No patients match this search.'
              : 'No patients have been registered yet.'
          }
        />
      ) : (
        <>
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-160 text-left text-sm">
              <thead>
                <tr className="border-b border-glass-border bg-white/50 text-xs font-medium text-muted">
                  <th className="px-4 py-3.5 font-medium sm:px-5">Patient ID</th>
                  <th className="px-4 py-3.5 font-medium sm:px-5">Name</th>
                  <th className="px-4 py-3.5 font-medium sm:px-5">Mobile</th>
                  <th className="px-4 py-3.5 font-medium sm:px-5">Email</th>
                </tr>
              </thead>
              <tbody>
                {patientsQuery.data.patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-slate-100 transition-colors duration-200 last:border-0 hover:bg-white/55"
                  >
                    <td className="px-4 py-3.5 font-medium text-ink sm:px-5">
                      {patient.patientCode}
                    </td>
                    <td className="px-4 py-3.5 text-ink/80 sm:px-5">
                      {patient.name}
                    </td>
                    <td className="px-4 py-3.5 text-muted sm:px-5">
                      {patient.phone}
                    </td>
                    <td className="px-4 py-3.5 text-muted sm:px-5">
                      {patient.email ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Page {patientsQuery.data.pagination.page} of{' '}
              {Math.max(patientsQuery.data.pagination.totalPages, 1)} ·{' '}
              {patientsQuery.data.pagination.total} patients
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={patientsQuery.data.pagination.page <= 1}
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={
                  patientsQuery.data.pagination.page >=
                  patientsQuery.data.pagination.totalPages
                }
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
