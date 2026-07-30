import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { BookingService } from "../booking/booking.service";
import { BookingStatus } from "../../../generated/prisma/client";

type TechnicianFilters = {
  location?: string;
  minRating?: string;
};

type TechnicianProfileUpdatePayload = {
  bio?: string;
  location?: string;
  experience?: number;
};

type SlotCreatePayload = {
  startTime: string;
  endTime: string;
};

const getAllTechnicians = async (filters: TechnicianFilters) => {
  const where: Record<string, unknown> = {};
  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  if (filters.minRating) {
    const rating = parseFloat(filters.minRating);
    if (!isNaN(rating)) {
      where.rating = { gte: rating };
    }
  }
  return await prisma.technicianProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      technicianServices: {
        include: { service: { include: { category: true } } },
      },
    },
    orderBy: { rating: "desc" },
  });
};

const getTechnicianById = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      technicianServices: {
        include: { service: { include: { category: true } } },
      },
      review: {
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!technician) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician not found.");
  }
  return technician;
};

const updateProfile = async (userId: string, payload: TechnicianProfileUpdatePayload) => {
  const safePayload: TechnicianProfileUpdatePayload = {};
  if (payload.bio !== undefined) safePayload.bio = payload.bio;
  if (payload.location !== undefined) safePayload.location = payload.location;
  if (payload.experience !== undefined) safePayload.experience = payload.experience;

  return await prisma.technicianProfile.upsert({
    where: { userId },
    update: safePayload,
    create: { userId, ...safePayload },
  });
};

// ── Slot Management ─────────────────────────────────────────────────────

const createSlots = async (userId: string, slots: SlotCreatePayload[]) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found.");
  }

  const data = slots.map((slot) => ({
    technicianId: profile.id,
    startTime: new Date(slot.startTime),
    endTime: new Date(slot.endTime),
  }));

  await prisma.slot.createMany({ data });
  return await prisma.slot.findMany({
    where: { technicianId: profile.id },
    include: { booking: { select: { id: true, customerId: true, status: true } } },
    orderBy: { startTime: "asc" },
  });
};

const getMySlots = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found.");
  }
  return await prisma.slot.findMany({
    where: { technicianId: profile.id },
    include: { booking: { select: { id: true, customerId: true, status: true } } },
    orderBy: { startTime: "asc" },
  });
};

const deleteSlot = async (userId: string, slotId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found.");
  }
  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: { booking: true },
  });
  if (!slot || slot.technicianId !== profile.id) {
    throw new ApiError(httpStatus.NOT_FOUND, "Slot not found.");
  }
  if (slot.booking) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot delete a booked slot.");
  }
  await prisma.slot.delete({ where: { id: slotId } });
  return { message: "Slot deleted successfully." };
};

const getTechnicianSlots = async (technicianId: string) => {
  return await prisma.slot.findMany({
    where: { technicianId, booking: null, startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
  });
};

// ── Service Linking ─────────────────────────────────────────────────────

const linkService = async (userId: string, serviceId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found.");
  }
  const service = await prisma.service.findUnique({ where: { id: serviceId, isDeleted: false } });
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found.");
  }

  const existing = await prisma.technicianService.findUnique({
    where: { technicianId_serviceId: { technicianId: profile.id, serviceId } },
  });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Service already linked to your profile.");
  }

  return await prisma.technicianService.create({
    data: { technicianId: profile.id, serviceId },
    include: { service: { include: { category: true } } },
  });
};

const unlinkService = async (userId: string, serviceId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found.");
  }
  const link = await prisma.technicianService.findUnique({
    where: { technicianId_serviceId: { technicianId: profile.id, serviceId } },
  });
  if (!link) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service link not found.");
  }
  await prisma.technicianService.delete({
    where: { technicianId_serviceId: { technicianId: profile.id, serviceId } },
  });
  return { message: "Service unlinked successfully." };
};

const getMyServices = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found.");
  }
  return await prisma.technicianService.findMany({
    where: { technicianId: profile.id },
    include: { service: { include: { category: true } } },
  });
};

// ── Bookings ─────────────────────────────────────────────────────────────

const getAssignedBookings = async (userId: string, page: number = 1, limit: number = 10) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found.");
  }

  const skip = (page - 1) * limit;
  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where: { technicianId: profile.id, isDeleted: false },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        service: true,
        slot: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where: { technicianId: profile.id, isDeleted: false } }),
  ]);
  return { bookings, total, page, limit };
};

const advanceBookingState = async (userId: string, bookingId: string, targetStatus: BookingStatus) => {
  return await BookingService.updateBookingStateByTechnician(userId, bookingId, targetStatus);
};

export const TechnicianService = {
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
