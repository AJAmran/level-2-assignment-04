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




export const bookingController = {
  createBooking,
};