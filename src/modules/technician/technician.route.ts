import { Router } from "express";
import { TechnicianController } from "./technician.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const publicRouter = Router();
publicRouter.get("/", TechnicianController.getAllTechnicians);
publicRouter.get("/:id", TechnicianController.getTechnicianById);
publicRouter.get("/:id/slots", TechnicianController.getTechnicianSlots);

const operationsRouter = Router();
operationsRouter.put("/profile", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.updateTechnicianProfileSchema), TechnicianController.updateProfile);

// Slot management
operationsRouter.post("/slots", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.createSlotsSchema), TechnicianController.createSlots);
operationsRouter.get("/slots", authGuard(UserRole.TECHNICIAN), TechnicianController.getMySlots);
operationsRouter.delete("/slots/:id", authGuard(UserRole.TECHNICIAN), TechnicianController.deleteSlot);

// Service linking
operationsRouter.post("/services", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.linkServiceSchema), TechnicianController.linkService);
operationsRouter.get("/services", authGuard(UserRole.TECHNICIAN), TechnicianController.getMyServices);
operationsRouter.delete("/services/:serviceId", authGuard(UserRole.TECHNICIAN), TechnicianController.unlinkService);

// Bookings
operationsRouter.get("/bookings", authGuard(UserRole.TECHNICIAN), TechnicianController.getAssignedBookings);
operationsRouter.patch("/bookings/:id", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.updateBookingStatusSchema), TechnicianController.advanceBookingState);

export const TechniciansPublicRoutes = publicRouter;
export const TechnicianOperationsRoutes = operationsRouter;
