import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { catchAsync } from "../utils/catchAsync";

/** Validate and coerce req.body against a Zod schema. */
export const validateRequest = (schema: ZodSchema) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync(req.body);
    req.body = parsed;
    next();
  });
};

/** Validate and coerce req.query against a Zod schema. */
export const validateQuery = (schema: ZodSchema) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync(req.query);
    req.query = parsed as typeof req.query;
    next();
  });
};

/** Validate req.params against a Zod schema. */
export const validateParams = (schema: ZodSchema) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync(req.params);
    req.params = parsed as typeof req.params;
    next();
  });
};
