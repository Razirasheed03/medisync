import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getApiErrorMessage, getApiValidationIssues } from '@/api/client'
import { Button, Input } from '@/components/ui'

import type { CreatePatientInput } from '../types'

const patientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 characters')
    .max(30, 'Phone number cannot exceed 30 characters')
    .regex(/^\+?[0-9\s().-]+$/, 'Enter a valid phone number'),
  email: z
    .string()
    .trim()
    .max(254)
    .email('Enter a valid email address')
    .or(z.literal('')),
})

type PatientFormValues = z.infer<typeof patientFormSchema>

const issuePathToField: Record<string, keyof PatientFormValues> = {
  name: 'name',
  phone: 'phone',
  email: 'email',
}

interface PatientFormProps {
  submitLabel: string
  onSubmit: (input: CreatePatientInput) => Promise<unknown>
  onCancel?: () => void
}

export function PatientForm({
  submitLabel,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { name: '', phone: '', email: '' },
  })

  const submit = async (values: PatientFormValues) => {
    setServerError(null)

    const input: CreatePatientInput = {
      name: values.name,
      phone: values.phone,
      ...(values.email ? { email: values.email } : {}),
    }

    try {
      await onSubmit(input)
    } catch (error) {
      const issues = getApiValidationIssues(error)
      let hasFieldError = false

      for (const issue of issues) {
        const field = issuePathToField[issue.path.split('.')[0] ?? '']
        if (field) {
          setError(field, { type: 'server', message: issue.message })
          hasFieldError = true
        }
      }

      if (!hasFieldError) {
        setServerError(getApiErrorMessage(error))
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {serverError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {serverError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Full name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Mobile number"
          type="tel"
          placeholder="+91 98765 43210"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Email (optional)"
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
