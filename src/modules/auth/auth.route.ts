import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";

const route = Router();

route.post("/register", AuthController.register);
route.post("/login", AuthController.login);
route.post("/refresh-token", AuthController.refreshToken);
route.get(
  "/getme",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  AuthController.getMe,
);

export const AuthRoutes = route;
