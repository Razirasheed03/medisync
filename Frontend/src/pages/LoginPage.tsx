import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import { Button, Card, Input } from '@/components/ui'
import { login } from '@/features/auth'
import { paths } from '@/routes/paths'

const TEST_ADMIN_CREDENTIALS = {
  email: 'superadmin@medisync.test',
  password: 'MediSync@Test2026!',
} as const

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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? paths.dashboard

  const fillTestCredentials = () => {
    setServerError(null)
    setValue('email', TEST_ADMIN_CREDENTIALS.email, {
      shouldDirty: true,
      shouldValidate: true,
    })
    setValue('password', TEST_ADMIN_CREDENTIALS.password, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

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
    <Card className="w-full max-w-sm">
      <h1 className="text-lg font-semibold text-ink">Sign in</h1>
      <p className="mt-1.5 text-sm text-muted">
        Use your clinic credentials to continue.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        {serverError ? (
          <div
            role="alert"
            className="rounded-xl border border-danger/20 bg-red-50/80 px-3 py-2 text-sm text-danger"
          >
            {serverError}
          </div>
        ) : null}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@clinic.com"
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

        <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-5 rounded-xl border border-brand-200/80 bg-brand-50/70 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Test admin credentials
          </p>
          <button
            type="button"
            onClick={fillTestCredentials}
            disabled={isSubmitting}
            className="shrink-0 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors duration-200 hover:bg-white hover:text-brand-800 disabled:pointer-events-none disabled:opacity-50"
          >
            Use these
          </button>
        </div>
        <dl className="mt-2 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Email</dt>
            <dd className="font-mono font-medium text-ink">
              {TEST_ADMIN_CREDENTIALS.email}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Password</dt>
            <dd className="font-mono font-medium text-ink">
              {TEST_ADMIN_CREDENTIALS.password}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}
