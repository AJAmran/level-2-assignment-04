import { Router } from "express";
import { AuthController } from "./auth.controller";

const route = Router();

route.post("/register", AuthController.register);
route.post("/login", AuthController.login);

export const AuthRoutes = route;
