/**
 * Request Validation Middleware
 * Validates the incoming request body against a Zod schema.
 * Parsed (and possibly transformed) data replaces req.body before reaching the controller.
 * Throws a ZodError on validation failure, which is handled by the global error handler.
 */
import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { catchAsync } from "../utils/catchAsync";

export const validateRequest = (schema: ZodSchema) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync(req.body);
    req.body = parsed;
    next();
  });
};
