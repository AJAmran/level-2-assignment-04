import { z } from "zod";

const registerValidationSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z
    .enum(["CUSTOMER", "TECHNICIAN"], {
      message: "Role must be either CUSTOMER or TECHNICIAN",
    })
    .optional()
    .default("CUSTOMER"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const loginValidationSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
