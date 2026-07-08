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

router.patch(
  "/:id",
  authGuard(UserRole.TECHNICIAN),
  validateRequest(GlobalValidations.updateServiceSchema),
  ServiceController.updateService,
);

router.delete(
  "/:id",
  authGuard(UserRole.TECHNICIAN),
  ServiceController.deleteService,
);

export const ServiceRoutes = router;
