import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { BookingService } from "../booking/booking.service";
import { BookingStatus } from "../../../generated/prisma/client";

type TechnicianFilters = {
  location?: string;
  minRating?: string;
};

const getAllTechnicians = async (filters: TechnicianFilters) => {
  const where: any = {};
  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  if (filters.minRating) {
    where.rating = { gte: parseFloat(filters.minRating) };
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
    throw new ApiError(httpStatus.NOT_FOUND, "Technician not found");
  }
  return technician;
};

const updateProfile = async (userId: string, payload: any) => {
  return await prisma.technicianProfile.upsert({
    where: { userId },
    update: payload,
    create: { userId, ...payload },
  });
};

const updateAvailability = async (userId: string, slots: string[]) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found");
  }
  // Availability is stored as a JSON array of ISO time strings
  // Use raw query since client types are generated before migration for this new field
  await prisma.$executeRawUnsafe(
    `UPDATE technician_profiles SET availability = $1::jsonb, "updatedAt" = NOW() WHERE "userId" = $2`,
    JSON.stringify(slots),
    userId
  );
  return await prisma.technicianProfile.findUnique({ where: { userId } });
};

const getAssignedBookings = async (userId: string) => {
  // Resolve the technicianProfile from the userId
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "Technician profile not found");
  }
  return await prisma.booking.findMany({
    where: { technicianId: profile.id, isDeleted: false },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      service: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const advanceBookingState = async (userId: string, bookingId: string, targetStatus: BookingStatus) => {
  // Delegate to BookingService which has full state-machine validation
  return await BookingService.updateBookingStateByTechnician(userId, bookingId, targetStatus);
};

export const TechnicianService = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getAssignedBookings,
  advanceBookingState,
};

