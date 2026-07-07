import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { bookingController } from "./booking.controller";

const router = Router();

router.get(
  "/",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  bookingController.getUserBookings,
);
router.get(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  bookingController.getBookingDetails,
);
router.patch(
  "/:id/status",
  authGuard(UserRole.TECHNICIAN, UserRole.ADMIN),
  bookingController.updateBookingStateByTechnician,
);
router.patch(
  "/:id/cancel",
  authGuard(UserRole.CUSTOMER),
  bookingController.cancelBooking,
);
router.post("/", authGuard(UserRole.CUSTOMER), bookingController.createBooking);

export const BookingRoutes = router;
