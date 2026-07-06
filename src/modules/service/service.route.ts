import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { ServiceController } from "./service.controller";

const router = Router();

router.get("/", ServiceController.getAllServices);

router.post(
  "/",
  authGuard(UserRole.TECHNICIAN),
  ServiceController.createService,
);

export const ServiceRoutes = router;
