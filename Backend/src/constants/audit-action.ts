export const AUDIT_ACTIONS = [
  "LOGIN",
  "APPOINTMENT_CREATED",
  "APPOINTMENT_UPDATED",
  "APPOINTMENT_CANCELLED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = ["User", "Appointment"] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];
