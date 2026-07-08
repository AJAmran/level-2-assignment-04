/**
 * Auth Controller
 *
 * Handles HTTP request/response lifecycle for authentication endpoints.
 * Delegates business logic to AuthService and formats responses.
 *
 * @module AuthController
 */
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

/**
 * Register a new user account.
 * Responds with 201 Created and the new user data (excluding password).
 */
const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User registered successfully",
    data: result,
  });
});

/** Whether the app is running in a production environment. */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Authenticate a user with email and password.
 * Sets httpOnly cookies for accessToken and refreshToken,
 * then responds with token and user data.
 */
const login = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await AuthService.loginUser(
    req.body,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: { accessToken, refreshToken, user },
  });
});

/**
 * Refresh an expired access token using a valid refresh token.
 * Reads the refresh token from cookies, verifies it, issues a new access token,
 * and sets it as an httpOnly cookie.
 */
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token not found");
  }

  const result = await AuthService.rotateSessionToken(token);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token renewed successfully",
    data: result,
  });
});

/**
 * Retrieve the profile of the currently authenticated user.
 * Relies on authGuard middleware to populate `req.user`.
 */
const getMe = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user!;
  const result = await AuthService.getMe(id, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile context retrieved successfully",
    data: result,
  });
});

/** Aggregated auth controller object for route binding. */
export const AuthController = {
  register,
  login,
  refreshToken,
  getMe
};
