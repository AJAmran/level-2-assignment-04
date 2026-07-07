import { catchAsync } from "../../utils/catchAsync";
import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

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
