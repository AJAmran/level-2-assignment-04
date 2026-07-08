/**
 * Booking controller layer.
 *
 * Handles HTTP requests for booking operations, delegates business logic
 * to `BookingService`, and sends structured JSON responses.
 */

import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

/**
 * Create a new booking on behalf of the authenticated customer.
 * Expects `serviceId` and `scheduledTime` in the request body.
 */
const createBooking = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const result = await BookingService.createBooking(customerId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

/**
 * Retrieve all bookings for the authenticated user.
 * Results are filtered by role (customer sees own bookings, technician sees assigned bookings, admin sees all).
 */
const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user!;
  const result = await BookingService.getUserBookings(id, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookings fetched successfully",
    data: result,
  });
});

/**
 * Retrieve detailed information for a single booking by its ID.
 * Role-based access control ensures only authorized users can view the booking.
 */
const getBookingDetails = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user!;
  const bookingId = req.params.id;

  if (typeof bookingId !== "string") {
    throw new Error("Invalid booking id");
  }

  const result = await BookingService.getBookingDetails(bookingId, id, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking details record structured successfully",
    data: result,
  });
});

/**
 * Transition a booking to a new status (e.g., ACCEPTED, IN_PROGRESS, COMPLETED).
 * Only technicians and admins are authorized to perform this action.
 */
const updateBookingStateByTechnician = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const bookingId = req.params.id;

  if (typeof bookingId !== "string") {
    throw new Error("Invalid booking id");
  }

  const result = await BookingService.updateBookingStateByTechnician(userId, bookingId, req.body.status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Booking state successfully transformed to ${req.body.status}`,
    data: result,
  });
});

/**
 * Cancel a booking by the owning customer.
 * Only allowed when the booking is in REQUESTED or ACCEPTED state.
 */
const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const bookingId = req.params.id;

  if (typeof bookingId !== "string") {
    throw new Error("Invalid booking id");
  }

  const result = await BookingService.cancelBookingByCustomer(customerId, bookingId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking cancellation request processed successfully",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getUserBookings,
  getBookingDetails,
  updateBookingStateByTechnician,
  cancelBooking,
};
