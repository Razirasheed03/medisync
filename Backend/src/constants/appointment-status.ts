export const APPOINTMENT_STATUSES = [
  "BOOKED",
  "ARRIVED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Statuses that occupy a slot and must stay unique per doctor/slot. */
export const SLOT_HOLDING_STATUSES = [
  "BOOKED",
  "ARRIVED",
  "COMPLETED",
] as const satisfies readonly AppointmentStatus[];

/**
 * Allowed status transitions. Cancelled appointments can be re-booked,
 * completed appointments are terminal.
 */
export const APPOINTMENT_STATUS_TRANSITIONS: Readonly<
  Record<AppointmentStatus, readonly AppointmentStatus[]>
> = {
  BOOKED: ["ARRIVED", "COMPLETED", "CANCELLED"],
  ARRIVED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: ["BOOKED"],
};
