/** Single source of truth for every route path in the application. */
export const paths = {
  login: '/login',
  dashboard: '/',
  doctorSchedules: '/doctor-schedules',
  appointmentScheduler: '/scheduler',
  appointments: '/appointments',
  appointmentCreate: '/appointments/new',
  appointmentDetails: (id: string) => `/appointments/${id}`,
  appointmentEdit: (id: string) => `/appointments/${id}/edit`,
  users: '/users',
  userCreate: '/users/new',
  userEdit: (id: string) => `/users/${id}/edit`,
  patients: '/patients',
} as const
