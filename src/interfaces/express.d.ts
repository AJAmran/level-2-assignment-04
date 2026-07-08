/**
 * Express Type Augmentation
 * Extends the Express Request interface to include the authenticated user.
 * The `user` property is attached by the authGuard middleware after JWT verification.
 */
import { UserRole } from "../../generated/prisma/enums";


declare global {
  namespace Express {
    interface Request {
      /** Authenticated user context injected by authGuard middleware */
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}