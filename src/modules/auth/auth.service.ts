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

export const AuthService = {
  registerUser,
  loginUser,
  rotateSessionToken,
  getMe,
};
