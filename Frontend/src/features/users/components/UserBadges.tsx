import { cn } from '@/utils'

import type { ManagedUserRole, UserStatus } from '../types'

export function UserRoleBadge({ role }: { role: ManagedUserRole }) {
  return (
    <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
      {role === 'DOCTOR' ? 'Doctor' : 'Receptionist'}
    </span>
  )
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        status === 'ACTIVE'
          ? 'bg-emerald-50 text-success'
          : 'bg-slate-100/80 text-muted',
      )}
    >
      {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </span>
  )
}
