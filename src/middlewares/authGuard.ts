import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { ApiError } from "../utils/ApiError";
import { jwtHelpers } from "../utils/jwtHelpers";
import config from "../config";
import { prisma } from "../lib/prisma";

export const authGuard = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized to access this resource",
      );
    }

    let decodedUser;
    try {
      decodedUser = jwtHelpers.verifyToken(token, config.jwt_access_secret);
    } catch (error) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired access token",
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decodedUser.id,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "User not found or has been deleted",
      );
    }

    if (user.status === "BANNED") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Your account has been suspended. Please contact support.",
      );
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new ApiError(
        403,
        "Forbidden: You do not have permission to perform this action",
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  });
};
