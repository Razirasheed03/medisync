import { useNavigate, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import { Card, ErrorState, PageHeader, Spinner } from '@/components/ui'
import {
  EditUserForm,
  ResetPasswordForm,
  useManagedUser,
  useResetUserPassword,
  useUpdateUser,
} from '@/features/users'
import { useToast } from '@/providers'
import { paths } from '@/routes/paths'

export function EditUserPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const userQuery = useManagedUser(id)
  const updateMutation = useUpdateUser(id)
  const resetPasswordMutation = useResetUserPassword(id)

  if (userQuery.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16">
        <Spinner />
        <span className="text-sm font-medium text-slate-500">
          Loading user…
        </span>
      </div>
    )
  }

  if (userQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(userQuery.error)}
        onRetry={() => void userQuery.refetch()}
      />
    )
  }

  const user = userQuery.data

  return (
    <>
      <PageHeader
        title="Edit User"
        description={`Manage ${user.name}'s account.`}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-5 text-base font-semibold text-slate-900">
            Account details
          </h2>
          <EditUserForm
            user={user}
            onSubmit={async (input) => {
              const updated = await updateMutation.mutateAsync(input)
              showToast(`${updated.name} was updated successfully.`)
              navigate(paths.users)
            }}
          />
        </Card>

        <Card className="self-start">
          <h2 className="text-base font-semibold text-slate-900">
            Reset password
          </h2>
          <p className="mb-5 mt-1 text-sm text-slate-500">
            Set a temporary password and share it securely with the user.
            Existing sessions will be signed out.
          </p>
          <ResetPasswordForm
            onSubmit={async (password) => {
              await resetPasswordMutation.mutateAsync(password)
              showToast(`Password reset for ${user.name}.`)
            }}
          />
        </Card>
      </div>
    </>
  )
}
