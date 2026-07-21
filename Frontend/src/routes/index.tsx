import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { LoadingScreen } from '@/components/common'
import { AppLayout, AuthLayout } from '@/layouts'

import { paths } from './paths'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { RoleRoute } from './RoleRoute'
import { SuperAdminRoute } from './SuperAdminRoute'

const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const DoctorSchedulesPage = lazy(() =>
  import('@/pages/DoctorSchedulesPage').then((m) => ({
    default: m.DoctorSchedulesPage,
  })),
)
const AppointmentSchedulerPage = lazy(() =>
  import('@/pages/AppointmentSchedulerPage').then((m) => ({
    default: m.AppointmentSchedulerPage,
  })),
)
const AppointmentsPage = lazy(() =>
  import('@/pages/AppointmentsPage').then((m) => ({
    default: m.AppointmentsPage,
  })),
)
const CreateAppointmentPage = lazy(() =>
  import('@/pages/CreateAppointmentPage').then((m) => ({
    default: m.CreateAppointmentPage,
  })),
)
const AppointmentDetailsPage = lazy(() =>
  import('@/pages/AppointmentDetailsPage').then((m) => ({
    default: m.AppointmentDetailsPage,
  })),
)
const EditAppointmentPage = lazy(() =>
  import('@/pages/EditAppointmentPage').then((m) => ({
    default: m.EditAppointmentPage,
  })),
)
const UsersPage = lazy(() =>
  import('@/pages/UsersPage').then((m) => ({ default: m.UsersPage })),
)
const CreateUserPage = lazy(() =>
  import('@/pages/CreateUserPage').then((m) => ({
    default: m.CreateUserPage,
  })),
)
const EditUserPage = lazy(() =>
  import('@/pages/EditUserPage').then((m) => ({ default: m.EditUserPage })),
)
const PatientsPage = lazy(() =>
  import('@/pages/PatientsPage').then((m) => ({ default: m.PatientsPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: paths.login, element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.dashboard, element: <DashboardPage /> },
          { path: paths.doctorSchedules, element: <DoctorSchedulesPage /> },
          { path: paths.appointments, element: <AppointmentsPage /> },
          {
            path: '/appointments/:id',
            element: <AppointmentDetailsPage />,
          },
          {
            element: <RoleRoute roles={['SUPER_ADMIN', 'RECEPTIONIST']} />,
            children: [
              { path: paths.patients, element: <PatientsPage /> },
              {
                path: paths.appointmentScheduler,
                element: <AppointmentSchedulerPage />,
              },
              {
                path: paths.appointmentCreate,
                element: <CreateAppointmentPage />,
              },
              {
                path: '/appointments/:id/edit',
                element: <EditAppointmentPage />,
              },
            ],
          },
          {
            element: <SuperAdminRoute />,
            children: [
              { path: paths.users, element: <UsersPage /> },
              { path: paths.userCreate, element: <CreateUserPage /> },
              { path: '/users/:id/edit', element: <EditUserPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
