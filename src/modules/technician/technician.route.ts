import { Router } from "express";
import { TechnicianController } from "./technician.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const publicRouter = Router();
publicRouter.get("/", TechnicianController.getAllTechnicians);
publicRouter.get("/:id", TechnicianController.getTechnicianById);

const operationsRouter = Router();
operationsRouter.put("/profile", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.updateTechnicianProfileSchema), TechnicianController.updateProfile);
operationsRouter.put("/availability", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.updateAvailabilitySchema), TechnicianController.updateAvailability);
operationsRouter.get("/bookings", authGuard(UserRole.TECHNICIAN), TechnicianController.getAssignedBookings);
operationsRouter.patch("/bookings/:id", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.updateBookingStatusSchema), TechnicianController.advanceBookingState);

export const TechniciansPublicRoutes = publicRouter;
export const TechnicianOperationsRoutes = operationsRouter;
