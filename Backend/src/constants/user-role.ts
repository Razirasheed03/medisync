export const USER_ROLES = ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"] as const;

export type UserRole = (typeof USER_ROLES)[number];
