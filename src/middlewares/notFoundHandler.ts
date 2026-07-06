import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new ApiError(
      404,
      `API Endpoint Not Found: Can't find ${req.originalUrl} on this server`,
    ),
  );
};
