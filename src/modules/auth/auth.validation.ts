import { z } from "zod";

const registerValidationSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "CUSTOMER", "TECHNICIAN"]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const loginValidationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
