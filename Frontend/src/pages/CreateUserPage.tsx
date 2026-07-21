import { useNavigate } from 'react-router-dom'

import { Card, PageHeader } from '@/components/ui'
import { CreateUserForm, useCreateUser } from '@/features/users'
import { useToast } from '@/providers'
import { paths } from '@/routes/paths'

export function CreateUserPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const createMutation = useCreateUser()

  return (
    <>
      <PageHeader
        title="Create User"
        description="Create a doctor or receptionist account."
      />
      <Card className="w-full max-w-2xl">
        <CreateUserForm
          onSubmit={async (input) => {
            const user = await createMutation.mutateAsync(input)
            showToast(`${user.name} was created successfully.`)
            navigate(paths.users)
          }}
        />
      </Card>
    </>
  )
}
