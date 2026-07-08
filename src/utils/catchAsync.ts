/**
 * Async Error Wrapper
 * Wraps an Express request handler to catch any thrown errors and forward them
 * to the global error handler via next(). Eliminates the need for try-catch in every controller.
 */
import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
