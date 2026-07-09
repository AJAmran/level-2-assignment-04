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
  /** Prisma unique constraint violation -> 409 Conflict */
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      message = "Duplicate Resource Error";
      errorDetails = {
        message: `Unique constraint failed on the fields: ${(err.meta?.target as string[])?.join(", ") || "unknown"}`,
      };
    } else {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Database Error";
      errorDetails = {
        message: err.message,
      };
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