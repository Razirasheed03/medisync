import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getApiErrorMessage, getApiValidationIssues } from '@/api/client'
import { Button, Input, Select } from '@/components/ui'
import { useDoctors } from '@/features/appointments'

import type {
  CreateScheduleInput,
  DoctorSchedule,
  UpdateScheduleInput,
  Weekday,
} from '../types'
import { WEEKDAYS, WEEKDAY_LABELS } from '../types'

const timeSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:mm format')

const toMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const sessionSchema = z
  .object({
    startTime: timeSchema,
    endTime: timeSchema,
    breakStartTime: z.string(),
    breakEndTime: z.string(),
  })
  .superRefine((session, context) => {
    if (toMinutes(session.endTime) <= toMinutes(session.startTime)) {
      context.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'End time must be after start time',
      })
    }

    const hasBreakStart = session.breakStartTime.length > 0
    const hasBreakEnd = session.breakEndTime.length > 0

    if (hasBreakStart !== hasBreakEnd) {
      context.addIssue({
        code: 'custom',
        path: [hasBreakStart ? 'breakEndTime' : 'breakStartTime'],
        message: 'Break start and end times must be provided together',
      })
      return
    }

    if (hasBreakStart && hasBreakEnd) {
      const breakStart = toMinutes(session.breakStartTime)
      const breakEnd = toMinutes(session.breakEndTime)
      const sessionStart = toMinutes(session.startTime)
      const sessionEnd = toMinutes(session.endTime)

      if (breakEnd <= breakStart) {
        context.addIssue({
          code: 'custom',
          path: ['breakEndTime'],
          message: 'Break end must be after break start',
        })
      }

      if (breakStart <= sessionStart || breakEnd >= sessionEnd) {
        context.addIssue({
          code: 'custom',
          path: ['breakStartTime'],
          message: 'Break must be fully inside the session',
        })
      }
    }
  })

const scheduleFormSchema = z.object({
  doctorId: z.string().min(1, 'Select a doctor'),
  slotDuration: z
    .string()
    .trim()
    .min(1, 'Slot duration is required')
    .regex(/^[1-9]\d*$/, 'Slot duration must be a positive integer'),
  workingDays: z
    .array(
      z.object({
        day: z.enum(WEEKDAYS),
        sessions: z.array(sessionSchema).min(1, 'Add at least one session'),
      }),
    )
    .min(1, 'Add at least one working day'),
})

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>

const emptySession = {
  startTime: '09:00',
  endTime: '13:00',
  breakStartTime: '',
  breakEndTime: '',
}

interface ScheduleFormProps {
  schedule?: DoctorSchedule
  /** Doctors that already have a schedule (hidden from the create picker). */
  assignedDoctorIds?: readonly string[]
  submitLabel: string
  onCreate?: (input: CreateScheduleInput) => Promise<unknown>
  onUpdate?: (input: UpdateScheduleInput) => Promise<unknown>
  onCancel?: () => void
}

export function ScheduleForm({
  schedule,
  assignedDoctorIds = [],
  submitLabel,
  onCreate,
  onUpdate,
  onCancel,
}: ScheduleFormProps) {
  const isEditMode = Boolean(schedule)
  const [serverError, setServerError] = useState<string | null>(null)
  const doctorsQuery = useDoctors()

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      doctorId: schedule?.doctorId ?? '',
      slotDuration: String(schedule?.slotDuration ?? 30),
      workingDays: schedule
        ? schedule.workingDays.map((day) => ({
            day: day.day,
            sessions: day.sessions.map((session) => ({
              startTime: session.startTime,
              endTime: session.endTime,
              breakStartTime: session.breakStartTime ?? '',
              breakEndTime: session.breakEndTime ?? '',
            })),
          }))
        : [
            {
              day: 'MONDAY' as Weekday,
              sessions: [{ ...emptySession }],
            },
          ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workingDays',
  })

  const selectedDays = new Set(watch('workingDays').map((day) => day.day))
  const availableDoctors = (doctorsQuery.data ?? []).filter(
    (doctor) =>
      isEditMode ||
      !assignedDoctorIds.includes(doctor.id) ||
      doctor.id === schedule?.doctorId,
  )

  const submit = async (values: ScheduleFormValues) => {
    setServerError(null)

    const workingDays = values.workingDays.map((day) => ({
      day: day.day,
      sessions: day.sessions.map((session) => ({
        startTime: session.startTime,
        endTime: session.endTime,
        ...(session.breakStartTime
          ? { breakStartTime: session.breakStartTime }
          : {}),
        ...(session.breakEndTime
          ? { breakEndTime: session.breakEndTime }
          : {}),
      })),
    }))

    try {
      if (isEditMode) {
        await onUpdate?.({
          workingDays,
          slotDuration: Number(values.slotDuration),
        })
      } else {
        await onCreate?.({
          doctorId: values.doctorId,
          workingDays,
          slotDuration: Number(values.slotDuration),
          isActive: true,
        })
      }
    } catch (error) {
      const issues = getApiValidationIssues(error)
      if (issues.length === 0) {
        setServerError(getApiErrorMessage(error))
      } else {
        setServerError(issues.map((issue) => issue.message).join('. '))
      }
    }
  }

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Doctor"
          error={errors.doctorId?.message}
          disabled={isEditMode || doctorsQuery.isPending}
          {...register('doctorId')}
        >
          <option value="">
            {doctorsQuery.isPending ? 'Loading doctors…' : 'Select a doctor'}
          </option>
          {availableDoctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </Select>
        <Input
          label="Slot duration (minutes)"
          type="number"
          min={1}
          error={errors.slotDuration?.message}
          {...register('slotDuration')}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Working days</h3>
          <Button
            type="button"
            variant="secondary"
            disabled={selectedDays.size >= WEEKDAYS.length}
            onClick={() => {
              const nextDay = WEEKDAYS.find((day) => !selectedDays.has(day))
              if (nextDay) {
                append({ day: nextDay, sessions: [{ ...emptySession }] })
              }
            }}
          >
            Add day
          </Button>
        </div>

        {errors.workingDays?.message || errors.workingDays?.root?.message ? (
          <p role="alert" className="text-xs font-medium text-red-600">
            {errors.workingDays.message ?? errors.workingDays.root?.message}
          </p>
        ) : null}

        {fields.map((field, dayIndex) => (
          <WorkingDayEditor
            key={field.id}
            dayIndex={dayIndex}
            currentDay={watch(`workingDays.${dayIndex}.day`)}
            selectedDays={selectedDays}
            register={register}
            control={control}
            errors={errors}
            onRemove={() => remove(dayIndex)}
            canRemove={fields.length > 1}
          />
        ))}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

interface WorkingDayEditorProps {
  dayIndex: number
  currentDay: Weekday
  selectedDays: Set<Weekday>
  register: ReturnType<typeof useForm<ScheduleFormValues>>['register']
  control: ReturnType<typeof useForm<ScheduleFormValues>>['control']
  errors: ReturnType<typeof useForm<ScheduleFormValues>>['formState']['errors']
  onRemove: () => void
  canRemove: boolean
}

function WorkingDayEditor({
  dayIndex,
  currentDay,
  selectedDays,
  register,
  control,
  errors,
  onRemove,
  canRemove,
}: WorkingDayEditorProps) {
  const {
    fields: sessions,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `workingDays.${dayIndex}.sessions`,
  })

  const dayError = errors.workingDays?.[dayIndex]

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <Select
          label="Day"
          className="max-w-xs"
          {...register(`workingDays.${dayIndex}.day`)}
        >
          {WEEKDAYS.map((day) => (
            <option
              key={day}
              value={day}
              disabled={selectedDays.has(day) && day !== currentDay}
            >
              {WEEKDAY_LABELS[day]}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ ...emptySession })}
          >
            Add session
          </Button>
          {canRemove ? (
            <Button type="button" variant="ghost" onClick={onRemove}>
              Remove day
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sessions.map((session, sessionIndex) => {
          const sessionError = dayError?.sessions?.[sessionIndex]

          return (
            <div
              key={session.id}
              className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-5"
            >
              <Input
                label="Start"
                type="time"
                error={sessionError?.startTime?.message}
                {...register(
                  `workingDays.${dayIndex}.sessions.${sessionIndex}.startTime`,
                )}
              />
              <Input
                label="End"
                type="time"
                error={sessionError?.endTime?.message}
                {...register(
                  `workingDays.${dayIndex}.sessions.${sessionIndex}.endTime`,
                )}
              />
              <Input
                label="Break start"
                type="time"
                error={sessionError?.breakStartTime?.message}
                {...register(
                  `workingDays.${dayIndex}.sessions.${sessionIndex}.breakStartTime`,
                )}
              />
              <Input
                label="Break end"
                type="time"
                error={sessionError?.breakEndTime?.message}
                {...register(
                  `workingDays.${dayIndex}.sessions.${sessionIndex}.breakEndTime`,
                )}
              />
              <div className="flex items-end">
                {sessions.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remove(sessionIndex)}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
