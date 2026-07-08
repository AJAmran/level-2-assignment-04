/**
 * 404 Not Found Handler
 * Catches all unmatched routes and forwards a 404 ApiError to the global error handler.
 */
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import httpStatus from "http-status";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new ApiError(
      httpStatus.NOT_FOUND,
      `API Endpoint Not Found: Can't find ${req.originalUrl} on this server`,
    ),
  );
};
