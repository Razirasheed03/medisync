import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from '@/components/ui'
import {
  UserFilters,
  UserRoleBadge,
  UserStatusBadge,
  UsersPagination,
  useActivateUser,
  useDeactivateUser,
  useUsers,
  type ManagedUser,
  type UserListFilters,
} from '@/features/users'
import { useToast } from '@/providers'
import { paths } from '@/routes/paths'

const initialFilters: UserListFilters = {
  page: 1,
  limit: 10,
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const toggleToneClasses = {
  neutral:
    'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-slate-400',
  danger:
    'border-red-200 bg-red-50/60 text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700 focus-visible:outline-red-500',
  success:
    'border-emerald-200 bg-emerald-50/60 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-700 focus-visible:outline-emerald-500',
} as const

const toggleIconPaths = {
  neutral:
    'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
  danger:
    'M18.364 5.636a9 9 0 1 0-12.728 12.728 9 9 0 0 0 12.728-12.728Zm0 0L5.636 18.364',
  success: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
} as const

function StatusToggleButton({
  tone,
  label,
  onClick,
  disabled,
  fixedWidth,
}: {
  tone: keyof typeof toggleToneClasses
  label: string
  onClick: () => void
  disabled?: boolean
  fixedWidth?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 ${fixedWidth ? 'w-[7.25rem] px-0' : ''} ${toggleToneClasses[tone]}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="size-3.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={toggleIconPaths[tone]}
        />
      </svg>
      {label}
    </button>
  )
}

export function UsersPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [filters, setFilters] = useState<UserListFilters>(initialFilters)
  const [userToDeactivate, setUserToDeactivate] = useState<ManagedUser | null>(
    null,
  )
  const usersQuery = useUsers(filters)
  const deactivateMutation = useDeactivateUser()
  const activateMutation = useActivateUser()

  const activate = async (user: ManagedUser) => {
    try {
      await activateMutation.mutateAsync(user.id)
      showToast(`${user.name} has been activated.`)
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  const deactivate = async () => {
    if (!userToDeactivate) return

    try {
      await deactivateMutation.mutateAsync(userToDeactivate.id)
      showToast(`${userToDeactivate.name} has been deactivated.`)
      setUserToDeactivate(null)
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
      setUserToDeactivate(null)
    }
  }

  const hasFilters = Boolean(filters.search || filters.role || filters.status)

  return (
    <>
      <PageHeader
        title="User Management"
        description="Manage doctor and receptionist accounts."
        actions={
          <Button onClick={() => navigate(paths.userCreate)}>Create user</Button>
        }
      />

      <Card className="p-4 sm:p-6">
        <UserFilters filters={filters} onChange={setFilters} />
      </Card>

      {usersQuery.isPending ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16">
          <Spinner />
          <span className="text-sm font-medium text-slate-500">
            Loading users…
          </span>
        </div>
      ) : usersQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(usersQuery.error)}
          onRetry={() => void usersQuery.refetch()}
        />
      ) : usersQuery.data.users.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            hasFilters
              ? 'No users match the current filters.'
              : 'Create a doctor or receptionist account to get started.'
          }
        />
      ) : (
        <>
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-180 text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 sm:px-6">Name</th>
                  <th className="px-4 py-3 sm:px-6">Email</th>
                  <th className="px-4 py-3 sm:px-6">Role</th>
                  <th className="px-4 py-3 sm:px-6">Status</th>
                  <th className="px-4 py-3 sm:px-6">Created</th>
                  <th className="px-4 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 sm:px-6">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 sm:px-6">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 sm:px-6">
                      {dateFormatter.format(new Date(user.createdAt))}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <div className="flex justify-end gap-2">
                        <StatusToggleButton
                          tone="neutral"
                          label="Edit"
                          onClick={() => navigate(paths.userEdit(user.id))}
                        />
                        {user.status === 'ACTIVE' ? (
                          <StatusToggleButton
                            tone="danger"
                            label="Deactivate"
                            fixedWidth
                            onClick={() => setUserToDeactivate(user)}
                          />
                        ) : (
                          <StatusToggleButton
                            tone="success"
                            label="Activate"
                            fixedWidth
                            disabled={activateMutation.isPending}
                            onClick={() => void activate(user)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <UsersPagination
            pagination={usersQuery.data.pagination}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(userToDeactivate)}
        title="Deactivate this user?"
        description={`${
          userToDeactivate?.name ?? 'This user'
        } will no longer be able to sign in. Their existing records will be preserved.`}
        confirmLabel="Deactivate user"
        isConfirming={deactivateMutation.isPending}
        onConfirm={() => void deactivate()}
        onCancel={() => setUserToDeactivate(null)}
      />
    </>
  )
}
