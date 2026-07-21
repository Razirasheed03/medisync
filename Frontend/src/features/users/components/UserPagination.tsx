import { Button } from '@/components/ui'

import type { UserPagination as UserPaginationData } from '../types'

export function UsersPagination({
  pagination,
  onPageChange,
}: {
  pagination: UserPaginationData
  onPageChange: (page: number) => void
}) {
  if (pagination.total === 0) return null

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        Page {pagination.page} of {Math.max(pagination.totalPages, 1)} ·{' '}
        {pagination.total} {pagination.total === 1 ? 'user' : 'users'}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
