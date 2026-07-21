import type { RequestUser } from "./auth.js";

declare global {
  namespace Express {
    interface User extends RequestUser {}

    interface Request {
      user?: User;
    }
  }
}

export {};
