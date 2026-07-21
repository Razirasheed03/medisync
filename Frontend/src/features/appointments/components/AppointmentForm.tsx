import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getApiErrorMessage, getApiValidationIssues } from '@/api/client'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { PatientSearchPicker, type Patient } from '@/features/patients'
import { cn } from '@/utils'

import { useDoctors } from '../hooks'
import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  type Appointment,
  type CreateAppointmentInput,
  type Department,
  type UpdateAppointmentInput,
} from '../types'
import { SlotPicker } from './SlotPicker'

const appointmentFormSchema = z
  .object({
    patientMode: z.enum(['existing', 'new']),
    patientId: z.string(),
    patientName: z.string().trim(),
    patientEmail: z.string().trim(),
    patientPhone: z.string().trim(),
    doctorId: z.string().min(1, 'Select a doctor'),
    appointmentDate: z.string().min(1, 'Select a date'),
    startTime: z.string().min(1, 'Select a time slot'),
    endTime: z.string().min(1, 'Select a time slot'),
    purpose: z
      .string()
      .trim()
      .max(500, 'Purpose cannot exceed 500 characters'),
    notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters'),
  })
  .superRefine((values, context) => {
    if (values.patientMode === 'existing') {
      if (!values.patientId) {
        context.addIssue({
          code: 'custom',
          path: ['patientId'],
          message: 'Search and select a patient',
        })
      }
      return
    }

    if (values.patientName.length < 2) {
      context.addIssue({
        code: 'custom',
        path: ['patientName'],
        message: 'Patient name must be at least 2 characters',
      })
    }

    if (
      values.patientPhone.length < 7 ||
      !/^\+?[0-9\s().-]+$/.test(values.patientPhone)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['patientPhone'],
        message: 'Enter a valid mobile number (at least 7 characters)',
      })
    }

    if (
      values.patientEmail &&
      !z.email().safeParse(values.patientEmail).success
    ) {
      context.addIssue({
        code: 'custom',
        path: ['patientEmail'],
        message: 'Enter a valid email address',
      })
    }
  })

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

/** Maps backend validation issue paths onto form field names. */
const issuePathToField: Partial<
  Record<string, keyof AppointmentFormValues>
> = {
  patientId: 'patientId',
  patientName: 'patientName',
  patientEmail: 'patientEmail',
  patientPhone: 'patientPhone',
  doctorId: 'doctorId',
  appointmentDate: 'appointmentDate',
  startTime: 'startTime',
  endTime: 'endTime',
  purpose: 'purpose',
  notes: 'notes',
}

export interface AppointmentSlotPrefill {
  doctorId?: string
  appointmentDate?: string
  startTime?: string
  endTime?: string
}

interface AppointmentFormProps {
  /** Existing appointment to prefill when editing (locks the patient). */
  appointment?: Appointment
  /** Doctor/date/slot preselected from the scheduler. */
  initialSlot?: AppointmentSlotPrefill
  submitLabel: string
  /** Required in create mode. */
  onCreate?: (input: CreateAppointmentInput) => Promise<unknown>
  /** Required in edit mode. */
  onUpdate?: (input: UpdateAppointmentInput) => Promise<unknown>
}

export function AppointmentForm({
  appointment,
  initialSlot,
  submitLabel,
  onCreate,
  onUpdate,
}: AppointmentFormProps) {
  const isEditMode = Boolean(appointment)
  const [serverError, setServerError] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [department, setDepartment] = useState<Department | ''>(
    appointment?.department ?? '',
  )
  const doctorsQuery = useDoctors(department || undefined)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientMode: isEditMode ? 'existing' : 'new',
      patientId: appointment?.patientId ?? '',
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      doctorId: appointment?.doctorId ?? initialSlot?.doctorId ?? '',
      appointmentDate:
        appointment?.appointmentDate ?? initialSlot?.appointmentDate ?? '',
      startTime: appointment?.startTime ?? initialSlot?.startTime ?? '',
      endTime: appointment?.endTime ?? initialSlot?.endTime ?? '',
      purpose: appointment?.purpose ?? '',
      notes: appointment?.notes ?? '',
    },
  })

  const patientMode = watch('patientMode')
  const doctorId = watch('doctorId')
  const appointmentDate = watch('appointmentDate')
  const startTime = watch('startTime')
  const endTime = watch('endTime')

  // Clear the selected slot whenever doctor or date changes away from
  // the combination the slot was picked for.
  useEffect(() => {
    const matchesOriginal =
      (appointment &&
        doctorId === appointment.doctorId &&
        appointmentDate === appointment.appointmentDate) ||
      (initialSlot &&
        doctorId === initialSlot.doctorId &&
        appointmentDate === initialSlot.appointmentDate)

    if (!matchesOriginal) {
      setValue('startTime', '', { shouldValidate: false })
      setValue('endTime', '', { shouldValidate: false })
    } else {
      const original = appointment ?? initialSlot
      setValue('startTime', original?.startTime ?? '', {
        shouldValidate: false,
      })
      setValue('endTime', original?.endTime ?? '', { shouldValidate: false })
    }
  }, [doctorId, appointmentDate, appointment, initialSlot, setValue])

  const submit = async (values: AppointmentFormValues) => {
    setServerError(null)

    try {
      if (isEditMode) {
        const input: UpdateAppointmentInput = {
          doctorId: values.doctorId,
          appointmentDate: values.appointmentDate,
          startTime: values.startTime,
          endTime: values.endTime,
          purpose: values.purpose || null,
          notes: values.notes || null,
        }
        await onUpdate?.(input)
      } else {
        const input: CreateAppointmentInput = {
          ...(values.patientMode === 'existing'
            ? { patientId: values.patientId }
            : {
                patientName: values.patientName,
                patientPhone: values.patientPhone,
                ...(values.patientEmail
                  ? { patientEmail: values.patientEmail }
                  : {}),
              }),
          doctorId: values.doctorId,
          appointmentDate: values.appointmentDate,
          startTime: values.startTime,
          endTime: values.endTime,
          ...(values.purpose ? { purpose: values.purpose } : {}),
          ...(values.notes ? { notes: values.notes } : {}),
        }
        await onCreate?.(input)
      }
    } catch (error) {
      const issues = getApiValidationIssues(error)
      let hasFieldError = false

      for (const issue of issues) {
        const field = issuePathToField[issue.path.split('.')[0] ?? '']
        if (field) {
          setError(field, { type: 'server', message: issue.message })
          hasFieldError = true
        }
      }

      if (!hasFieldError) {
        setServerError(getApiErrorMessage(error))
      }
    }
  }

  const slotError = errors.startTime?.message ?? errors.endTime?.message
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex flex-col gap-6"
    >
      {serverError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {serverError}
        </div>
      ) : null}

      {isEditMode && appointment ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Patient
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {appointment.patientName} · {appointment.patientPhone}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex rounded-lg border border-slate-200 p-1">
            {(
              [
                ['existing', 'Existing patient'],
                ['new', 'New patient'],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setValue('patientMode', mode)
                  clearErrors([
                    'patientId',
                    'patientName',
                    'patientEmail',
                    'patientPhone',
                  ])
                }}
                className={cn(
                  'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  patientMode === mode
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {patientMode === 'existing' ? (
            <PatientSearchPicker
              selectedPatient={selectedPatient}
              onSelect={(patient) => {
                setSelectedPatient(patient)
                setValue('patientId', patient?.id ?? '', {
                  shouldValidate: Boolean(patient),
                })
              }}
              {...(errors.patientId?.message
                ? { error: errors.patientId.message }
                : {})}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Patient name"
                placeholder="Jane Doe"
                error={errors.patientName?.message}
                {...register('patientName')}
              />
              <Input
                label="Mobile number"
                type="tel"
                placeholder="+91 98765 43210"
                error={errors.patientPhone?.message}
                {...register('patientPhone')}
              />
              <Input
                label="Email (optional)"
                type="email"
                placeholder="jane@example.com"
                error={errors.patientEmail?.message}
                {...register('patientEmail')}
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          label="Department"
          value={department}
          onChange={(event) => {
            setDepartment(event.target.value as Department | '')
            setValue('doctorId', '', { shouldValidate: false })
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
          error={errors.doctorId?.message}
          disabled={doctorsQuery.isPending}
          {...register('doctorId')}
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
          error={errors.appointmentDate?.message}
          {...register('appointmentDate')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Slots</span>
        <SlotPicker
          doctorId={doctorId}
          date={appointmentDate}
          selectedSlot={startTime && endTime ? { startTime, endTime } : null}
          heldSlot={
            appointment
              ? {
                  startTime: appointment.startTime,
                  endTime: appointment.endTime,
                }
              : null
          }
          onSelect={(slot) => {
            setValue('startTime', slot.startTime, { shouldValidate: true })
            setValue('endTime', slot.endTime, { shouldValidate: true })
          }}
          {...(slotError ? { error: slotError } : {})}
        />
      </div>

      <Input
        label="Purpose (optional)"
        placeholder="Consultation, follow-up, check-up…"
        error={errors.purpose?.message}
        {...register('purpose')}
      />

      <Textarea
        label="Notes (optional)"
        placeholder="Symptoms or other details…"
        error={errors.notes?.message}
        {...register('notes')}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
