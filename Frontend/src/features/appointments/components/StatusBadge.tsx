import { cn } from '@/utils'

import type { AppointmentStatus } from '../types'

const statusClasses: Record<AppointmentStatus, string> = {
  BOOKED: 'bg-brand-50 text-brand-700 ring-brand-200',
  ARRIVED: 'bg-amber-50 text-amber-700 ring-amber-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-200',
}

const statusLabels: Record<AppointmentStatus, string> = {
  BOOKED: 'Booked',
  ARRIVED: 'Arrived',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

interface StatusBadgeProps {
  status: AppointmentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        statusClasses[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
