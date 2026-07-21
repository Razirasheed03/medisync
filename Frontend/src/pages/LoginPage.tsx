import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import { Button, Card, Input } from '@/components/ui'
import { login } from '@/features/auth'
import { paths } from '@/routes/paths'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LocationState {
  from?: { pathname?: string }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? paths.dashboard

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)

    try {
      await login(values)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-xl font-bold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">
        Enter your credentials to access your workspace.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        {serverError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {serverError}
          </div>
        ) : null}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Card>
  )
}
