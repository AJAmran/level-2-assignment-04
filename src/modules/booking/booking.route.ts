/**
 * Booking routes configuration.
 *
 * Defines RESTful endpoints for booking CRUD operations, including:
 * - Fetching user bookings (admin, customer, technician)
 * - Retrieving single booking details
 * - Updating booking status (technician/admin)
 * - Cancelling a booking (customer)
 * - Creating a new booking (customer)
 *
 * Every route is protected by the `authGuard` middleware with role-based access control,
 * and mutation routes are validated via `validateRequest`.
 */

import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { bookingController } from "./booking.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const router = Router();

/** GET / — Retrieve all bookings for the authenticated user (admin, customer, technician). */
router.get(
  "/",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  bookingController.getUserBookings,
);

/** GET /:id — Retrieve details of a single booking by its ID. */
router.get(
  "/:id",
  authGuard(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  bookingController.getBookingDetails,
);

/** PATCH /:id/status — Update the status of a booking (technician or admin only). */
router.patch(
  "/:id/status",
  authGuard(UserRole.TECHNICIAN, UserRole.ADMIN),
  validateRequest(GlobalValidations.updateBookingStatusSchema),
  bookingController.updateBookingStateByTechnician,
);

/** PATCH /:id/cancel — Cancel a booking by the owning customer. */
router.patch(
  "/:id/cancel",
  authGuard(UserRole.CUSTOMER),
  bookingController.cancelBooking,
);

/** POST / — Create a new booking (customer only). */
router.post("/", authGuard(UserRole.CUSTOMER), validateRequest(GlobalValidations.createBookingSchema), bookingController.createBooking);

export const BookingRoutes = router;
