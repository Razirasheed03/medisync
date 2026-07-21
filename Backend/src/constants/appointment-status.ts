export const APPOINTMENT_STATUSES = [
  "BOOKED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
