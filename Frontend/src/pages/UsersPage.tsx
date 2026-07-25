import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
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
        title="Users"
        description="Manage doctor and receptionist accounts."
        actions={
          <Button onClick={() => navigate(paths.userCreate)}>Create user</Button>
        }
      />

      <Card className="p-4 sm:p-5">
        <UserFilters filters={filters} onChange={setFilters} />
      </Card>

      {usersQuery.isPending ? (
        <LoadingBlock label="Loading users…" variant="table" />
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
                <tr className="border-b border-glass-border bg-white/50 text-xs font-medium text-muted">
                  <th className="px-4 py-3.5 font-medium sm:px-5">Name</th>
                  <th className="px-4 py-3.5 font-medium sm:px-5">Email</th>
                  <th className="px-4 py-3.5 font-medium sm:px-5">Role</th>
                  <th className="px-4 py-3.5 font-medium sm:px-5">Status</th>
                  <th className="px-4 py-3.5 font-medium sm:px-5">Created</th>
                  <th className="px-4 py-3.5 text-right font-medium sm:px-5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 transition-colors duration-200 last:border-0 hover:bg-white/55"
                  >
                    <td className="px-4 py-3.5 font-medium text-ink sm:px-5">
                      {user.name}
                    </td>
                    <td className="px-4 py-3.5 text-muted sm:px-5">
                      {user.email}
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3.5 text-muted sm:px-5">
                      {dateFormatter.format(new Date(user.createdAt))}
                    </td>
                    <td className="px-4 py-3.5 sm:px-5">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          className="px-2.5 py-1.5 text-xs"
                          onClick={() => navigate(paths.userEdit(user.id))}
                        >
                          Edit
                        </Button>
                        {user.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            className="px-2.5 py-1.5 text-xs text-danger hover:bg-red-50/80 hover:text-danger"
                            onClick={() => setUserToDeactivate(user)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            className="px-2.5 py-1.5 text-xs text-success hover:bg-emerald-50"
                            disabled={activateMutation.isPending}
                            onClick={() => void activate(user)}
                          >
                            Activate
                          </Button>
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
