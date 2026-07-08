import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TechnicianService } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

/** Retrieve all technicians with optional location/rating filters. */
const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    location: req.query.location as string | undefined,
    minRating: req.query.minRating as string | undefined,
  };
  const result = await TechnicianService.getAllTechnicians(filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technicians retrieved successfully",
    data: result,
  });
});

/** Retrieve a single technician's full profile by ID. */
const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await TechnicianService.getTechnicianById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician profile retrieved successfully",
    data: result,
  });
});

/** Update the authenticated technician's profile (bio, location, experience). */
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await TechnicianService.updateProfile(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician profile updated successfully",
    data: result,
  });
});

/** Update the authenticated technician's availability time slots. */
const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await TechnicianService.updateAvailability(userId, req.body.slots);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician availability updated successfully",
    data: result,
  });
});

/** Retrieve the authenticated technician's assigned bookings (paginated). */
const getAssignedBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await TechnicianService.getAssignedBookings(userId, page, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Assigned bookings retrieved successfully",
    data: result,
  });
});

/** Advance a booking's status (e.g. ACCEPTED -> IN_PROGRESS -> COMPLETED). */
const advanceBookingState = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const bookingId = req.params.id as string;
  const { status } = req.body;
  const result = await TechnicianService.advanceBookingState(userId, bookingId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Booking status updated to ${status} successfully`,
    data: result,
  });
});

export const TechnicianController = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getAssignedBookings,
  advanceBookingState,
};

