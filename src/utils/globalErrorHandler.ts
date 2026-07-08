import { ErrorRequestHandler } from "express";
import { TErrorSources } from "../interfaces/error.interface.js";
import { ApiError } from "./ApiError";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorDetails: any = err;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorDetails = {
      issues: err.issues.map((issue) => ({
        field: issue.path[issue.path.length - 1],
        message: issue.message,
      })),
      name: "ZodError"
    };
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = {
      path: "",
      message: err.message,
    };
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "Duplicate Resource Error";
      errorDetails = {
        message: `Unique constraint failed on the fields: ${(err.meta?.target as string[])?.join(", ") || "unknown"}`,
      };
    } else {
      statusCode = 400;
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

  // Include stack trace if not in production
  if (process.env.NODE_ENV !== "production" && err instanceof Error) {
    errorDetails = {
      ...errorDetails,
      stack: err.stack,
    };
  }

  // The requirement asks for success, message, errorDetails strictly.
  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};