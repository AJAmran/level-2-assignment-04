/**
 * Auth Routes
 *
 * Defines HTTP routes for authentication-related operations:
 * - POST /register   — Register a new user
 * - POST /login      — Authenticate and receive tokens
 * - POST /refresh-token — Rotate an expired access token
 * - GET  /me         — Fetch the currently authenticated user's profile
 *
 * @module AuthRoutes
 */
import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

/** Express router instance for auth endpoints. */
const route = Router();

route.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register
);
route.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login
);
route.post("/refresh-token", AuthController.refreshToken);
route.get(
  "/me",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  AuthController.getMe,
);

export const AuthRoutes = route;
