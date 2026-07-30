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

/** Update the authenticated technician's profile. */
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

// ── Slot Management ─────────────────────────────────────────────────────

const createSlots = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await TechnicianService.createSlots(userId, req.body.slots);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Slots created successfully",
    data: result,
  });
});

const getMySlots = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await TechnicianService.getMySlots(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Slots retrieved successfully",
    data: result,
  });
});

const deleteSlot = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const slotId = req.params.id as string;
  const result = await TechnicianService.deleteSlot(userId, slotId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Slot deleted successfully",
    data: result,
  });
});

/** Public: get available slots for a technician. */
const getTechnicianSlots = catchAsync(async (req: Request, res: Response) => {
  const technicianId = req.params.id as string;
  const result = await TechnicianService.getTechnicianSlots(technicianId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Available slots retrieved successfully",
    data: result,
  });
});

// ── Service Linking ─────────────────────────────────────────────────────

const linkService = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { serviceId } = req.body;
  const result = await TechnicianService.linkService(userId, serviceId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Service linked successfully",
    data: result,
  });
});

const unlinkService = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const serviceId = req.params.serviceId as string;
  const result = await TechnicianService.unlinkService(userId, serviceId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service unlinked successfully",
    data: result,
  });
});

const getMyServices = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await TechnicianService.getMyServices(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your services retrieved successfully",
    data: result,
  });
});

// ── Bookings ─────────────────────────────────────────────────────────────

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
  createSlots,
  getMySlots,
  deleteSlot,
  getTechnicianSlots,
  linkService,
  unlinkService,
  getMyServices,
  getAssignedBookings,
  advanceBookingState,
};
