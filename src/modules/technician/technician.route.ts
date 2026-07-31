import { Router } from "express";
import { TechnicianController } from "./technician.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { validateParams, validateQuery, validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const publicRouter = Router();
publicRouter.get("/", TechnicianController.getAllTechnicians);
publicRouter.get("/:id", validateParams(GlobalValidations.uuidParamSchema), TechnicianController.getTechnicianById);
publicRouter.get("/:id/slots", validateParams(GlobalValidations.uuidParamSchema), TechnicianController.getTechnicianSlots);

const operationsRouter = Router();
operationsRouter.put("/profile", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.updateTechnicianProfileSchema), TechnicianController.updateProfile);

// Slot management
operationsRouter.post("/slots", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.createSlotsSchema), TechnicianController.createSlots);
operationsRouter.get("/slots", authGuard(UserRole.TECHNICIAN), TechnicianController.getMySlots);
operationsRouter.delete("/slots/:id", authGuard(UserRole.TECHNICIAN), validateParams(GlobalValidations.uuidParamSchema), TechnicianController.deleteSlot);

// Service linking
operationsRouter.post("/services", authGuard(UserRole.TECHNICIAN), validateRequest(GlobalValidations.linkServiceSchema), TechnicianController.linkService);
operationsRouter.get("/services", authGuard(UserRole.TECHNICIAN), TechnicianController.getMyServices);
operationsRouter.delete("/services/:serviceId", authGuard(UserRole.TECHNICIAN), validateParams(GlobalValidations.uuidParamSchema), TechnicianController.unlinkService);

// Bookings
operationsRouter.get("/bookings", authGuard(UserRole.TECHNICIAN), validateQuery(GlobalValidations.paginationSchema), TechnicianController.getAssignedBookings);
operationsRouter.patch("/bookings/:id", authGuard(UserRole.TECHNICIAN), validateParams(GlobalValidations.uuidParamSchema), validateRequest(GlobalValidations.updateBookingStatusSchema), TechnicianController.advanceBookingState);

export const TechniciansPublicRoutes = publicRouter;
export const TechnicianOperationsRoutes = operationsRouter;
