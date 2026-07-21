import { useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import { Button, Input, Spinner } from '@/components/ui'
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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {selectedPatient.name}
            </p>
            <p className="text-xs text-slate-600">
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
        <p className="text-sm text-slate-500">
          Start typing to search by patient ID, mobile number, or name.
        </p>
      ) : patientsQuery.isPending ? (
        <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
          <Spinner className="size-4" />
          Searching patients…
        </div>
      ) : patientsQuery.isError ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {getApiErrorMessage(patientsQuery.error)}
        </p>
      ) : patientsQuery.data.patients.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-4 text-center text-sm text-slate-500">
          No patients match this search. Switch to “New patient” to register
          them.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {patientsQuery.data.patients.map((patient) => (
            <li key={patient.id}>
              <button
                type="button"
                onClick={() => onSelect(patient)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-50"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    {patient.name}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {patient.patientCode} · {patient.phone}
                  </span>
                </span>
                <span className="text-xs font-semibold text-brand-700">
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
