import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { bookingController } from "./booking.controller";
import { validateParams, validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const router = Router();

router.get(
  "/",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  bookingController.getUserBookings,
);

router.get(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  validateParams(GlobalValidations.uuidParamSchema),
  bookingController.getBookingDetails,
);

router.patch(
  "/:id/status",
  authGuard(UserRole.TECHNICIAN, UserRole.ADMIN),
  validateParams(GlobalValidations.uuidParamSchema),
  validateRequest(GlobalValidations.updateBookingStatusSchema),
  bookingController.updateBookingStateByTechnician,
);

router.patch(
  "/:id/cancel",
  authGuard(UserRole.CUSTOMER),
  validateParams(GlobalValidations.uuidParamSchema),
  bookingController.cancelBooking,
);

router.post(
  "/",
  authGuard(UserRole.CUSTOMER),
  validateRequest(GlobalValidations.createBookingSchema),
  bookingController.createBooking,
);

export const BookingRoutes = router;
