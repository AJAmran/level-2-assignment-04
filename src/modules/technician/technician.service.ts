import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { BookingService } from "../booking/booking.service";
import { BookingStatus } from "../../../generated/prisma/client";

type TechnicianFilters = {
  location?: string;
  minRating?: string;
};

// Strict whitelist type for profile update — prevents injecting
// sensitive fields like rating, userId, or id via the API
type TechnicianProfileUpdatePayload = {
  bio?: string;
  location?: string;
  experience?: number;
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
      services: { include: { category: true } },
    },
    orderBy: { rating: "desc" },
  });
};

const getTechnicianById = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      services: { include: { category: true } },
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

const updateProfile = async (
  userId: string,
  payload: TechnicianProfileUpdatePayload,
) => {
  // Only allow whitelisted fields — never let bio/location/experience
  // carry through any extra keys from the request body
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

const updateAvailability = async (userId: string, slots: string[]) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found.");
  }

  // Prisma handles Json fields natively — no raw SQL needed
  return await prisma.technicianProfile.update({
    where: { userId },
    data: { availability: slots },
  });
};

const getAssignedBookings = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
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
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.booking.count({
      where: { technicianId: profile.id, isDeleted: false },
    }),
  ]);
  return { bookings, total, page, limit };
};

const advanceBookingState = async (
  userId: string,
  bookingId: string,
  targetStatus: BookingStatus,
) => {
  // Delegate to BookingService which has full state-machine validation
  return await BookingService.updateBookingStateByTechnician(
    userId,
    bookingId,
    targetStatus,
  );
};

export const TechnicianService = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getAssignedBookings,
  advanceBookingState,
};
