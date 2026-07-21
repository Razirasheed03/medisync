import { Button } from '@/components/ui'

import type { AppointmentPagination } from '../types'

interface PaginationProps {
  pagination: AppointmentPagination
  onPageChange: (page: number) => void
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = pagination

  if (total === 0) return null

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        Page {page} of {Math.max(totalPages, 1)} · {total}{' '}
        {total === 1 ? 'appointment' : 'appointments'}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
