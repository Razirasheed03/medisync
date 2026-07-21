import { useNavigate } from 'react-router-dom'

import { Button, Card } from '@/components/ui'
import { startPlaceholderSession } from '@/features/auth'
import { paths } from '@/routes/paths'

export function LoginPage() {
  const navigate = useNavigate()

  const handlePlaceholderSignIn = () => {
    startPlaceholderSession()
    navigate(paths.dashboard, { replace: true })
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-xl font-bold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">
        The login form will be implemented in a later phase. Use the
        placeholder session below to preview the application shell.
      </p>
      <Button className="mt-6 w-full" onClick={handlePlaceholderSignIn}>
        Continue with placeholder session
      </Button>
    </Card>
  )
}
