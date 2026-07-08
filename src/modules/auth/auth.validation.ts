/**
 * Auth Validation Schemas
 *
 * Zod schemas for validating incoming request bodies in auth endpoints.
 * Ensures that registration and login payloads meet required constraints
 * before reaching the service layer.
 *
 * @module AuthValidation
 */
import { z } from "zod";

/** Validation schema for user registration payload. */
const registerValidationSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "TECHNICIAN"], {
    message: "Role must be either CUSTOMER or TECHNICIAN",
  }).optional().default("CUSTOMER"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

/** Validation schema for login payload. */
const loginValidationSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/** Aggregated auth validation object for route-level middleware. */
export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
