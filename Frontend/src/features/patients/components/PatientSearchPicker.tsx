import { useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import { Button, Input, Skeleton } from '@/components/ui'
import { useDebouncedValue } from '@/hooks'

import { usePatients } from '../hooks'
import type { Patient } from '../types'

interface PatientSearchPickerProps {
  selectedPatient: Patient | null
  onSelect: (patient: Patient | null) => void
  error?: string
}

/**
 * Searches existing patients by patient ID, mobile number, or name and
 * lets the user pick one for booking.
 */
export function PatientSearchPicker({
  selectedPatient,
  onSelect,
  error,
}: PatientSearchPickerProps) {
  const [searchInput, setSearchInput] = useState('')

  // Live search: query once the user pauses typing.
  const search = useDebouncedValue(searchInput.trim(), 300)

  const patientsQuery = usePatients(
    { search, page: 1, limit: 5 },
    search.length > 0,
  )

  if (selectedPatient) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200/60 bg-brand-50/80 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-ink">
              {selectedPatient.name}
            </p>
            <p className="text-xs text-muted">
              {selectedPatient.patientCode} · {selectedPatient.phone}
              {selectedPatient.email ? ` · ${selectedPatient.email}` : ''}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onSelect(null)}
          >
            Change patient
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        label="Search patient"
        placeholder="Patient ID, mobile number, or name…"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />

      {search.length === 0 ? (
        <p className="text-sm text-muted">
          Start typing to search by patient ID, mobile number, or name.
        </p>
      ) : patientsQuery.isPending ? (
        <div
          role="status"
          aria-label="Searching patients"
          className="overflow-hidden rounded-xl border border-glass-border bg-white/70"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
            >
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-32 rounded-full" />
                <Skeleton className="h-3 w-40 rounded-full" />
              </div>
              <Skeleton className="h-3 w-10 rounded-full" />
            </div>
          ))}
          <span className="sr-only">Searching patients…</span>
        </div>
      ) : patientsQuery.isError ? (
        <p role="alert" className="text-sm text-danger">
          {getApiErrorMessage(patientsQuery.error)}
        </p>
      ) : patientsQuery.data.patients.length === 0 ? (
        <p className="rounded-xl border border-dashed border-glass-border bg-white/60 px-4 py-4 text-center text-sm text-muted">
          No patients match this search. Switch to “New patient” to register
          them.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-glass-border bg-white/70">
          {patientsQuery.data.patients.map((patient) => (
            <li key={patient.id}>
              <button
                type="button"
                onClick={() => onSelect(patient)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-brand-50/70"
              >
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {patient.name}
                  </span>
                  <span className="block text-xs text-muted">
                    {patient.patientCode} · {patient.phone}
                  </span>
                </span>
                <span className="text-xs font-medium text-brand-600">
                  Select
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
