/**
 * Auth Interfaces
 *
 * Defines TypeScript response types used throughout the auth module.
 * These types ensure consistent shape for login, token-refresh, and profile responses.
 *
 * @module AuthTypes
 */
import { User } from "../../../generated/prisma/browser";

/** Response payload returned after a successful login. */
export type TLoginResponse = {
  /** JWT access token (short-lived). */
  accessToken: string;
  /** JWT refresh token (long-lived). */
  refreshToken: string;
  /** The authenticated user's data with the password field excluded. */
  user: Omit<User, "password">;
};

/** Response payload returned after a successful token refresh. */
export type TRefreshTokenResponse = {
  /** Newly issued JWT access token. */
  accessToken: string;
};

/** Response payload for the authenticated user's profile,
 *  optionally including a technician profile relation. */
export type TUserResponse = Omit<User, "password"> & {
  /** Technician-specific profile data, if the user role is TECHNICIAN. */
  technicianProfile?: Record<string, unknown> | null;
};