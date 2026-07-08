import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

const route = Router();

route.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register,
);
route.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);
route.post("/refresh-token", AuthController.refreshToken);
route.get(
  "/me",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  AuthController.getMe,
);

export const AuthRoutes = route;
