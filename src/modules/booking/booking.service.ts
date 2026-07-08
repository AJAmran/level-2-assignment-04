import {
  Booking,
  BookingStatus,
  UserRole,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

const createBooking = async (
  customerId: string,
  payload: Pick<Booking, "serviceId" | "scheduledTime">,
): Promise<Booking> => {
  const service = await prisma.service.findUnique({
    where: {
      id: payload.serviceId,
      isDeleted: false,
    },
  });

  if (!service) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Booking initialization failed: Selected service not found",
    );
  }

  return await prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianId,
      serviceId: payload.serviceId,
      scheduledTime: new Date(payload.scheduledTime),
      status: "REQUESTED",
    },
  });
};

const getUserBookings = async (
  userId: string,
  role: UserRole,
): Promise<Booking[]> => {
  const queryConditions: Record<string, string | boolean> = {
    isDeleted: false,
  };
  if (role === UserRole.CUSTOMER) {
    queryConditions.customerId = userId;
  } else if (role === UserRole.TECHNICIAN) {
    const profile = await prisma.technicianProfile.findUnique({
      where: {
        userId,
      },
    });
    if (!profile) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Technician reference tracking map context missing",
      );
    }

    queryConditions.technicianId = profile.id;
  }

  return await prisma.booking.findMany({
    where: queryConditions,
    include: {
      customer: { select: { id: true, email: true } },
      service: { select: { id: true, name: true, price: true } },
      technician: { include: { user: { select: { email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getBookingDetails = async (
  bookingId: string,
  userId: string,
  role: UserRole,
): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, isDeleted: false },
    include: {
      customer: { select: { id: true, email: true } },
      service: true,
    },
  });
  if (!booking) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Target booking instance not discovered",
    );
  }

  //ensure security boundaries are locked unless requested by an admin
  if (role === UserRole.CUSTOMER && booking.customerId !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Unauthorized access to booking details",
    );
  }

  if (role === UserRole.TECHNICIAN) {
    const profile = await prisma.technicianProfile.findUnique({
      where: {
        userId,
      },
    });
    if (!profile || booking.technicianId !== profile.id) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Access Denied: Resource identity mismatch",
      );
    }
  }
  return booking;
};

const updateBookingStateByTechnician = async (
  userId: string,
  bookingId: string,
  targetStatus: BookingStatus,
): Promise<Booking> => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  if (!profile)
    throw new ApiError(404, "Technician credentials context missing");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, isDeleted: false },
  });
  if (!booking || booking.technicianId !== profile.id) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No booking context discovered matching assignment metrics",
    );
  }

  // State Machine Rule Engine Validations
  if (targetStatus === "ACCEPTED" || targetStatus === "DECLINED") {
    if (booking.status !== "REQUESTED") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot shift booking state to ${targetStatus} from ${booking.status}`,
      );
    }
  }

  if (targetStatus === "IN_PROGRESS" && booking.status !== "PAID") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot move to in-progress state: Order payment requirement unfulfilled",
    );
  }

  if (targetStatus === "COMPLETED" && booking.status !== "IN_PROGRESS") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot complete job: Service execution must be marked in-progress first",
    );
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: targetStatus },
  });
};

const cancelBookingByCustomer = async (
  userId: string,
  bookingId: string,
): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, isDeleted: false },
  });
  if (!booking || booking.customerId !== userId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Target consumer booking record not found",
    );
  }

  // Enforce termination boundary constraints
  // Per requirements: customer can cancel before IN_PROGRESS
  // PAID bookings require a refund flow before cancellation
  const nonCancellableStatuses: BookingStatus[] = [
    "PAID",
    "IN_PROGRESS",
    "COMPLETED",
    "DECLINED",
    "CANCELLED",
  ];
  if (nonCancellableStatuses.includes(booking.status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cancellation not allowed: Booking is currently ${booking.status}. Only REQUESTED or ACCEPTED bookings can be cancelled.`,
    );
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingDetails,
  updateBookingStateByTechnician,
  cancelBookingByCustomer,
};
