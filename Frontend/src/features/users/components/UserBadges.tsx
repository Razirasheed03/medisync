import { cn } from '@/utils'

import type { ManagedUserRole, UserStatus } from '../types'

export function UserRoleBadge({ role }: { role: ManagedUserRole }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
      {role === 'DOCTOR' ? 'Doctor' : 'Receptionist'}
    </span>
  )
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        status === 'ACTIVE'
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-red-50 text-red-700 ring-red-200',
      )}
    >
      {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </span>
  )
}
