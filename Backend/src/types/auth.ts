import type { UserRole } from "../constants/user-role.js";

export interface AccessTokenPayload {
  readonly sub: string;
  readonly role: UserRole;
  readonly type: "access";
}

export interface RefreshTokenPayload {
  readonly sub: string;
  readonly type: "refresh";
}

export interface AuthenticatedUser {
  readonly id: string;
  readonly role: UserRole;
}

/** Request-scoped identity, enriched with the display name for auditing. */
export interface RequestUser extends AuthenticatedUser {
  readonly name: string;
}
