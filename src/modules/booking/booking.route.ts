import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { bookingController } from "./booking.controller";

const router = Router();

router.post(
  "/",
  authGuard(UserRole.CUSTOMER, UserRole.TECHNICIAN, UserRole.ADMIN),
  bookingController.createBooking,
);

export const BookingRoutes = router;
