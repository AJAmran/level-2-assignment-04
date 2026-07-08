/**
 * Custom Application Error Class
 * Extends the native Error with an HTTP status code.
 * Used throughout the application to signal operational errors with proper status codes.
 */
export class ApiError extends Error {
  /** HTTP status code for the error response */
  public statusCode: number;

  constructor(statusCode: number, message: string | undefined, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}