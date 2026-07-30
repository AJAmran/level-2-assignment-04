import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { ServiceController } from "./service.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const router = Router();

router.get("/", ServiceController.getAllServices);
router.get("/:id", ServiceController.getServiceById);

router.post(
  "/",
  authGuard(UserRole.TECHNICIAN, UserRole.ADMIN),
  validateRequest(GlobalValidations.createServiceSchema),
  ServiceController.createService,
);

router.patch(
  "/:id",
  authGuard(UserRole.TECHNICIAN, UserRole.ADMIN),
  validateRequest(GlobalValidations.updateServiceSchema),
  ServiceController.updateService,
);

router.delete(
  "/:id",
  authGuard(UserRole.TECHNICIAN, UserRole.ADMIN),
  ServiceController.deleteService,
);

export const ServiceRoutes = router;
