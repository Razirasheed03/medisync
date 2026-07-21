import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  Spinner,
} from '@/components/ui'
import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  SlotPicker,
  useDoctors,
  type Department,
} from '@/features/appointments'
import { paths } from '@/routes/paths'

/**
 * Appointment scheduler: filter by department / doctor / date and
 * visualize the available + booked slot grid. Selecting an available
 * slot navigates to the booking form with the slot pre-filled.
 */
export function AppointmentSchedulerPage() {
  const navigate = useNavigate()
  const [department, setDepartment] = useState<Department | ''>('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const doctorsQuery = useDoctors(department || undefined)

  const selectedDoctor = useMemo(
    () => doctorsQuery.data?.find((doctor) => doctor.id === doctorId),
    [doctorsQuery.data, doctorId],
  )

  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <PageHeader
        title="Appointment Scheduler"
        description="Browse available and booked slots by doctor, department, and date."
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate(paths.appointments)}
          >
            Appointment list
          </Button>
        }
      />

      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label="Department"
            value={department}
            onChange={(event) => {
              setDepartment(event.target.value as Department | '')
              setDoctorId('')
            }}
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((value) => (
              <option key={value} value={value}>
                {DEPARTMENT_LABELS[value]}
              </option>
            ))}
          </Select>

          <Select
            label="Doctor"
            value={doctorId}
            disabled={doctorsQuery.isPending}
            onChange={(event) => setDoctorId(event.target.value)}
          >
            <option value="">
              {doctorsQuery.isPending ? 'Loading doctors…' : 'Select a doctor'}
            </option>
            {(doctorsQuery.data ?? []).map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} · {DEPARTMENT_LABELS[doctor.department]}
              </option>
            ))}
          </Select>

          <Input
            label="Date"
            type="date"
            min={today}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      </Card>

      {doctorsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(doctorsQuery.error)}
          onRetry={() => void doctorsQuery.refetch()}
        />
      ) : !doctorId || !date ? (
        <EmptyState
          title="Select a doctor and date"
          description="Choose a department (optional), doctor, and date to view the slot grid."
        />
      ) : doctorsQuery.isPending ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16">
          <Spinner />
          <span className="text-sm font-medium text-slate-500">
            Loading doctors…
          </span>
        </div>
      ) : (
        <Card className="p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              {selectedDoctor?.name ?? 'Doctor'} · {date}
            </h2>
            <p className="text-sm text-slate-500">
              Click an available slot to start booking.
            </p>
          </div>
          <SlotPicker
            doctorId={doctorId}
            date={date}
            selectedSlot={null}
            onSelect={(slot) => {
              const params = new URLSearchParams({
                doctorId,
                date,
                startTime: slot.startTime,
                endTime: slot.endTime,
              })
              navigate(`${paths.appointmentCreate}?${params.toString()}`)
            }}
          />
        </Card>
      )}
    </>
  )
}
