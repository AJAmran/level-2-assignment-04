/**
 * Error Handling Type Definitions
 * Standardized structure for error responses across the application.
 */

/** Array of individual error source details (field-level validation errors) */
export type TErrorSources = {
  path: string | number;
  message: string;
}[];

/** Standard error response shape returned to the client */
export type TErrorResponse = {
  success: boolean;
  message: string;
  errorSources: TErrorSources;
  stack?: string;
};