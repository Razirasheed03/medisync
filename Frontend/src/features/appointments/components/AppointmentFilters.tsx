import { useEffect, useState } from 'react'

import { Button, Input, Select } from '@/components/ui'
import { useDebouncedValue } from '@/hooks'

import { useDoctors } from '../hooks'
import {
  APPOINTMENT_STATUSES,
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  type AppointmentListFilters,
  type AppointmentStatus,
  type Department,
} from '../types'

interface AppointmentFiltersProps {
  filters: AppointmentListFilters
  onChange: (filters: AppointmentListFilters) => void
  /** Doctors filter by themselves implicitly, so hide the doctor select. */
  showDoctorFilter?: boolean
}

/**
 * Search, doctor, department, status, and date-range filters plus a
 * date sort toggle for the appointment list page.
 */
export function AppointmentFilters({
  filters,
  onChange,
  showDoctorFilter = true,
}: AppointmentFiltersProps) {
  const doctorsQuery = useDoctors()
  const [searchInput, setSearchInput] = useState(filters.search ?? '')

  const update = (partial: Partial<AppointmentListFilters>) => {
    // Reset to the first page whenever a filter changes.
    const next = { ...filters, ...partial, page: 1 }

    if (!next.search) delete next.search
    if (!next.doctorId) delete next.doctorId
    if (!next.department) delete next.department
    if (!next.date) delete next.date
    if (!next.dateFrom) delete next.dateFrom
    if (!next.dateTo) delete next.dateTo
    if (!next.status) delete next.status

    onChange(next)
  }

  // Live search: apply the input once the user pauses typing.
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350)
  useEffect(() => {
    if (debouncedSearch !== (filters.search ?? '')) {
      update({ search: debouncedSearch })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Input
        label="Search patient"
        placeholder="Patient name or mobile…"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />

      {showDoctorFilter ? (
        <Select
          label="Doctor"
          value={filters.doctorId ?? ''}
          disabled={doctorsQuery.isPending}
          onChange={(event) => update({ doctorId: event.target.value })}
        >
          <option value="">All doctors</option>
          {(doctorsQuery.data ?? []).map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </Select>
      ) : null}

      <Select
        label="Department"
        value={filters.department ?? ''}
        onChange={(event) =>
          update({
            department: (event.target.value || undefined) as
              | Department
              | undefined,
          })
        }
      >
        <option value="">All departments</option>
        {DEPARTMENTS.map((department) => (
          <option key={department} value={department}>
            {DEPARTMENT_LABELS[department]}
          </option>
        ))}
      </Select>

      <Select
        label="Status"
        value={filters.status ?? ''}
        onChange={(event) =>
          update({
            status: (event.target.value || undefined) as
              | AppointmentStatus
              | undefined,
          })
        }
      >
        <option value="">All statuses</option>
        {APPOINTMENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </option>
        ))}
      </Select>

      <Input
        label="From date"
        type="date"
        value={filters.dateFrom ?? ''}
        onChange={(event) =>
          update({ dateFrom: event.target.value, date: undefined })
        }
      />

      <Input
        label="To date"
        type="date"
        value={filters.dateTo ?? ''}
        onChange={(event) =>
          update({ dateTo: event.target.value, date: undefined })
        }
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700">Sort by date</span>
        <Button
          variant="secondary"
          onClick={() =>
            onChange({
              ...filters,
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
            })
          }
        >
          {filters.sortOrder === 'asc' ? 'Oldest first ↑' : 'Newest first ↓'}
        </Button>
      </div>

      <div className="flex flex-col justify-end gap-1.5">
        <Button
          variant="ghost"
          onClick={() => {
            setSearchInput('')
            onChange({
              page: 1,
              limit: filters.limit,
              sortOrder: filters.sortOrder,
            })
          }}
        >
          Clear filters
        </Button>
      </div>
    </div>
  )
}
