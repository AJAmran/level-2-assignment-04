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
