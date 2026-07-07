import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { ServiceController } from "./service.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const router = Router();

router.get("/", ServiceController.getAllServices);

router.post(
  "/",
  authGuard(UserRole.TECHNICIAN),
  validateRequest(GlobalValidations.createServiceSchema),
  ServiceController.createService,
);

export const ServiceRoutes = router;
