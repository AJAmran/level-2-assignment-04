import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ApiError } from "./ApiError";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let errorDetails: any = err;

  /** Zod validation errors -> 400 with field-level issue details */
  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorDetails = {
      issues: err.issues.map((issue) => ({
        field: issue.path[issue.path.length - 1],
        message: issue.message,
      })),
      name: "ZodError"
    };
  /** Custom application errors -> use their assigned status code */
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = {
      path: "",
      message: err.message,
    };
  /** Prisma known request errors -> mapped to appropriate HTTP statuses */
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        statusCode = httpStatus.CONFLICT;
        message = "Duplicate Resource Error";
        errorDetails = {
          message: `Unique constraint failed on the fields: ${(err.meta?.target as string[])?.join(", ") || "unknown"}`,
        };
        break;
      case "P2003": // Foreign key constraint violation
        statusCode = httpStatus.BAD_REQUEST;
        message = "Referenced resource does not exist";
        errorDetails = { message: err.message };
        break;
      case "P2011": // Null constraint violation
        statusCode = httpStatus.BAD_REQUEST;
        message = "A required field is missing";
        errorDetails = { message: err.message };
        break;
      case "P2025": // Record not found
        statusCode = httpStatus.NOT_FOUND;
        message = "Resource not found";
        errorDetails = { message: err.message };
        break;
      default:
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = "Database Error";
        errorDetails = { message: err.message };
    }
  } else if (err instanceof Error) {
    message = err.message;
    errorDetails = {
      path: "",
      message: err.message,
    };
  }

  /** In non-production environments, include the stack trace for debugging */
  if (process.env.NODE_ENV !== "production" && err instanceof Error) {
    errorDetails = {
      ...errorDetails,
      stack: err.stack,
    };
  }

  /** Send the standardized error envelope */
  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};