import { useEffect, useState } from 'react'

import { Input, Select } from '@/components/ui'
import { useDebouncedValue } from '@/hooks'

import type {
  ManagedUserRole,
  UserListFilters,
  UserStatus,
} from '../types'

export function UserFilters({
  filters,
  onChange,
}: {
  filters: UserListFilters
  onChange: (filters: UserListFilters) => void
}) {
  const [search, setSearch] = useState(filters.search ?? '')

  const update = (partial: Partial<UserListFilters>) => {
    const next = { ...filters, ...partial, page: 1 }
    if (!next.search) delete next.search
    if (!next.role) delete next.role
    if (!next.status) delete next.status
    onChange(next)
  }

  // Live search: apply the input once the user pauses typing.
  const debouncedSearch = useDebouncedValue(search.trim(), 350)
  useEffect(() => {
    if (debouncedSearch !== (filters.search ?? '')) {
      update({ search: debouncedSearch })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2">
        <Input
          label="Search"
          type="search"
          placeholder="Search name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <Select
        label="Role"
        value={filters.role ?? ''}
        onChange={(event) =>
          update({
            role: (event.target.value || undefined) as
              | ManagedUserRole
              | undefined,
          })
        }
      >
        <option value="">All roles</option>
        <option value="DOCTOR">Doctor</option>
        <option value="RECEPTIONIST">Receptionist</option>
      </Select>
      <Select
        label="Status"
        value={filters.status ?? ''}
        onChange={(event) =>
          update({
            status: (event.target.value || undefined) as UserStatus | undefined,
          })
        }
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </Select>
    </div>
  )
}
