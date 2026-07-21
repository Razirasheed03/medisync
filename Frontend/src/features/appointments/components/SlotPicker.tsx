import { getApiErrorMessage } from '@/api/client'
import { Spinner } from '@/components/ui'
import { cn, formatTimeRange } from '@/utils'

import { useDoctorSlots } from '../hooks'
import type { DoctorSlot } from '../types'

interface SlotPickerProps {
  doctorId: string
  date: string
  selectedSlot: Pick<DoctorSlot, 'startTime' | 'endTime'> | null
  onSelect: (slot: Pick<DoctorSlot, 'startTime' | 'endTime'>) => void
  /**
   * Slot currently held by the appointment being edited. It is reported
   * as booked by the API but must remain selectable when rescheduling.
   */
  heldSlot?: Pick<DoctorSlot, 'startTime' | 'endTime'> | null
  error?: string
}

/**
 * Fetches the slot grid for a doctor + date and renders available and
 * booked slots. Shown only once both doctor and date are chosen.
 */
export function SlotPicker({
  doctorId,
  date,
  selectedSlot,
  onSelect,
  heldSlot,
  error,
}: SlotPickerProps) {
  const slotsQuery = useDoctorSlots(doctorId, date)

  if (!doctorId || !date) {
    return (
      <p className="text-sm text-slate-500">
        Select a doctor and date to see available slots.
      </p>
    )
  }

  if (slotsQuery.isPending) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
        <Spinner className="size-4" />
        Loading available slots…
      </div>
    )
  }

  if (slotsQuery.isError) {
    return (
      <p role="alert" className="text-sm font-medium text-red-600">
        {getApiErrorMessage(slotsQuery.error)}
      </p>
    )
  }

  const slots = slotsQuery.data.slots

  if (slots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
        No slots for this doctor on the selected date.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {slots.map((slot) => {
          const isSelected =
            selectedSlot?.startTime === slot.startTime &&
            selectedSlot?.endTime === slot.endTime
          const isHeld =
            heldSlot?.startTime === slot.startTime &&
            heldSlot?.endTime === slot.endTime
          const isBooked = slot.isBooked && !isHeld

          return (
            <button
              key={slot.startTime}
              type="button"
              disabled={isBooked}
              aria-pressed={isSelected}
              onClick={() => onSelect(slot)}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                isBooked
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                  : isSelected
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50',
              )}
              title={isBooked ? 'Slot already booked' : undefined}
            >
              {formatTimeRange(slot.startTime, slot.endTime)}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-slate-300 bg-white" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-slate-300" />
          Booked
        </span>
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
