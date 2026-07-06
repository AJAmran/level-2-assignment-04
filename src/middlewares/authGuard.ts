import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { ApiError } from "../utils/ApiError";
import { jwtHelpers } from "../utils/jwtHelpers";
import config from "../config";
import { prisma } from "../lib/prisma";

export const authGuard = (...requiredRole: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized to access this resource",
        );
      }
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



    
  });
};
