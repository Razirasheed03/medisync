import type { AuthenticatedUser } from "./auth.js";

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}

    interface Request {
      user?: User;
    }
  }
}

export {};
