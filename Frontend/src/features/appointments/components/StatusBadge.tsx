import { cn } from '@/utils'

import type { AppointmentStatus } from '../types'

const statusClasses: Record<AppointmentStatus, string> = {
  BOOKED: 'bg-brand-50 text-brand-700',
  ARRIVED: 'bg-amber-50 text-warning',
  COMPLETED: 'bg-emerald-50 text-success',
  CANCELLED: 'bg-slate-100/80 text-muted',
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
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusClasses[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
