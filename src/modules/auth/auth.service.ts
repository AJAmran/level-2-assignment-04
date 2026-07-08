import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import config from "../../config";
import {
  TLoginResponse,
  TRefreshTokenResponse,
  TUserResponse,
} from "./auth.interface";
import { jwtHelpers } from "../../utils/jwtHelpers";
import { User } from "../../../generated/prisma/client";

/**
 * Register a new user account.
 *
 * Checks for duplicate email, hashes the password, creates the user
 * (and optionally a TechnicianProfile for TECHNICIAN role) in a transaction,
 * then returns the new user data without the password field.
 *
 * @param payload - User input data (email, password, role, etc.)
 * @returns The created user object with the password omitted.
 * @throws ApiError 400 — if the email is already registered.
 */
const registerUser = async (payload: User): Promise<Omit<User, "password">> => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Account registration failed: Email already exists",
    );
  }

  // Hash plaintext password payload safely
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds),
  );

  const newUser = await prisma.$transaction(async (tx) => {
    const userResult = await tx.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        role: payload.role,
        name: payload.name,
        phone: payload.phone,
        address: payload.address,
      },
    });

    if (payload.role === "TECHNICIAN") {
      await tx.technicianProfile.create({
        data: {
          userId: userResult.id,
        },
      });
    }

    return userResult;
  });

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Authenticate a user with email and password.
 *
 * Validates credentials, checks account status, generates JWT access and
 * refresh tokens, and returns them alongside the user profile (without password).
 *
 * @param payload - Object containing email and plaintext password.
 * @returns An object containing accessToken, refreshToken, and sanitised user data.
 * @throws ApiError 404 — if no user exists with the given email.
 * @throws ApiError 403 — if the user's account is banned.
 * @throws ApiError 401 — if the password does not match.
 */
const loginUser = async (
  payload: Pick<User, "email" | "password">,
): Promise<TLoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email, isDeleted: false },
  });

  if (!user) {
    throw new ApiError(
      404,
      "No account discovered matching that email address",
    );
  }

  if (user.status === "BANNED") {
    throw new ApiError(
      403,
      "Access Denied: Your profile context has been banned",
    );
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new ApiError(
      401,
      "Authentication failed: Incorrect password credentials",
    );
  }

  const tokenPayload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );
  const refreshToken = jwtHelpers.generateToken(
    tokenPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );
  const { password: _, ...userWithoutPassword } = user;

  return {
    accessToken,
    refreshToken,
    user: userWithoutPassword,
  };
};

/**
 * Rotate (refresh) an existing session by verifying the refresh token
 * and issuing a new access token.
 *
 * @param token - The refresh token from the client.
 * @returns An object containing the newly generated access token.
 * @throws ApiError 401 — if the refresh token is invalid or expired.
 * @throws ApiError 403 — if the user no longer exists or is banned.
 */
const rotateSessionToken = async (
  token: string,
): Promise<TRefreshTokenResponse> => {
  let decodedPayload;
  try {
    decodedPayload = jwtHelpers.verifyToken(token, config.jwt_refresh_secret);
  } catch (error) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Session expired: Refresh token validation failure",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: decodedPayload.id, isDeleted: false },
  });

  if (!user || user.status === "BANNED") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Invalid security context for session rotation",
    );
  }

  const newAccessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  return { accessToken: newAccessToken };
};

/**
 * Retrieve the authenticated user's full profile.
 * Optionally includes the technicianProfile relation for TECHNICIAN roles.
 *
 * @param id   - The user's unique identifier.
 * @param role - The user's role (used to conditionally include relations).
 * @returns The user object with password excluded and optional related profiles.
 * @throws ApiError 404 — if the user is not found or is soft-deleted.
 */
const getMe = async (id: string, role: string): Promise<TUserResponse> => {
  const user = await prisma.user.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      technicianProfile: role === "TECHNICIAN",
    },
  });

  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Profile extraction error: User account tracking mismatch",
    );
  }

  const { password: _, ...cleanProfile } = user;
  return cleanProfile;
};

/** Aggregated auth service object for controller consumption. */
export const AuthService = {
  registerUser,
  loginUser,
  rotateSessionToken,
  getMe,
};
