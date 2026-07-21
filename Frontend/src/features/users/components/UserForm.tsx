import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getApiErrorMessage, getApiValidationIssues } from '@/api/client'
import { Button, Input, Select } from '@/components/ui'

import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  type CreateUserInput,
  type ManagedUser,
  type UpdateUserInput,
} from '../types'

const baseFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Enter a valid email address').max(254),
  role: z.enum(['DOCTOR', 'RECEPTIONIST']),
  department: z.enum(DEPARTMENTS).or(z.literal('')),
}

const createUserSchema = z
  .object({
    ...baseFields,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128),
  })
  .superRefine((values, context) => {
    if (values.role === 'DOCTOR' && !values.department) {
      context.addIssue({
        code: 'custom',
        path: ['department'],
        message: 'Department is required for doctors',
      })
    }
  })

const editUserSchema = z
  .object({
    ...baseFields,
    status: z.enum(['ACTIVE', 'INACTIVE']),
  })
  .superRefine((values, context) => {
    if (values.role === 'DOCTOR' && !values.department) {
      context.addIssue({
        code: 'custom',
        path: ['department'],
        message: 'Department is required for doctors',
      })
    }
  })

type CreateUserValues = z.infer<typeof createUserSchema>
type EditUserValues = z.infer<typeof editUserSchema>

const fieldNames = new Set([
  'name',
  'email',
  'password',
  'role',
  'status',
  'department',
])

function applyServerErrors(
  error: unknown,
  setFieldError: (field: string, message: string) => void,
): boolean {
  let applied = false

  for (const issue of getApiValidationIssues(error)) {
    const field = issue.path.split('.')[0] ?? ''
    if (fieldNames.has(field)) {
      setFieldError(field, issue.message)
      applied = true
    }
  }

  return applied
}

export function CreateUserForm({
  onSubmit,
}: {
  onSubmit: (input: CreateUserInput) => Promise<unknown>
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'DOCTOR',
      department: 'GENERAL_MEDICINE',
    },
  })

  const role = watch('role')

  const submit = async (values: CreateUserValues) => {
    setServerError(null)
    try {
      await onSubmit({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        ...(values.role === 'DOCTOR' && values.department
          ? { department: values.department }
          : {}),
      })
    } catch (error) {
      const applied = applyServerErrors(error, (field, message) => {
        setError(field as keyof CreateUserValues, {
          type: 'server',
          message,
        })
      })
      if (!applied) setServerError(getApiErrorMessage(error))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {serverError ? <FormError message={serverError} /> : null}
      <Input
        label="Full name"
        placeholder="Dr. Jane Doe"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="jane@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Select label="Role" error={errors.role?.message} {...register('role')}>
        <option value="DOCTOR">Doctor</option>
        <option value="RECEPTIONIST">Receptionist</option>
      </Select>
      {role === 'DOCTOR' ? (
        <Select
          label="Department"
          error={errors.department?.message}
          {...register('department')}
        >
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {DEPARTMENT_LABELS[department]}
            </option>
          ))}
        </Select>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create user'}
        </Button>
      </div>
    </form>
  )
}

export function EditUserForm({
  user,
  onSubmit,
}: {
  user: ManagedUser
  onSubmit: (input: UpdateUserInput) => Promise<unknown>
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department ?? '',
    },
  })

  const role = watch('role')

  const submit = async (values: EditUserValues) => {
    setServerError(null)
    try {
      await onSubmit({
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
        ...(values.role === 'DOCTOR' && values.department
          ? { department: values.department }
          : {}),
      })
    } catch (error) {
      const applied = applyServerErrors(error, (field, message) => {
        setError(field as keyof EditUserValues, { type: 'server', message })
      })
      if (!applied) setServerError(getApiErrorMessage(error))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {serverError ? <FormError message={serverError} /> : null}
      <Input
        label="Full name"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Select label="Role" error={errors.role?.message} {...register('role')}>
        <option value="DOCTOR">Doctor</option>
        <option value="RECEPTIONIST">Receptionist</option>
      </Select>
      {role === 'DOCTOR' ? (
        <Select
          label="Department"
          error={errors.department?.message}
          {...register('department')}
        >
          <option value="">Select department</option>
          {DEPARTMENTS.map((department) => (
            <option key={department} value={department}>
              {DEPARTMENT_LABELS[department]}
            </option>
          ))}
        </Select>
      ) : null}
      <Select
        label="Status"
        error={errors.status?.message}
        {...register('status')}
      >
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </Select>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}

function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
    >
      {message}
    </div>
  )
}
