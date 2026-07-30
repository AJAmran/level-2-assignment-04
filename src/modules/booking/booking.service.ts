import {
  Booking,
  BookingStatus,
  UserRole,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { getTechnicianProfileOrThrow } from "../../utils/getTechnicianProfile";
import { TCreateBookingPayload } from "./booking.interface";

const createBooking = async (
  customerId: string,
  payload: TCreateBookingPayload,
): Promise<Booking> => {
  const { serviceId, technicianId, slotId, address, phone } = payload;

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isDeleted: false },
  });
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found.");
  }

  const techService = await prisma.technicianService.findUnique({
    where: { technicianId_serviceId: { technicianId, serviceId } },
  });
  if (!techService) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This technician does not offer the selected service.",
    );
  }

  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: { booking: true },
  });
  if (!slot || slot.technicianId !== technicianId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Slot not found.");
  }
  if (slot.booking) {
    throw new ApiError(httpStatus.CONFLICT, "This slot is already booked.");
  }

  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        customerId,
        technicianId,
        serviceId,
        slotId,
        scheduledTime: slot.startTime,
        address,
        phone,
        status: "REQUESTED",
      },
    });
    return b;
  });

  return booking;
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
    const profile = await getTechnicianProfileOrThrow(
      userId,
      "Technician reference tracking map context missing",
    );
    queryConditions.technicianId = profile.id;
  } else if (role === UserRole.ADMIN) {
    return [];
  }

  return await prisma.booking.findMany({
    where: queryConditions,
    include: {
      customer: { select: { id: true, email: true, name: true } },
      service: { select: { id: true, name: true, price: true } },
      technician: { include: { user: { select: { id: true, email: true, name: true } } } },
      slot: true,
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
      customer: { select: { id: true, email: true, name: true } },
      service: true,
      slot: true,
    },
  });
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found.");
  }

  if (role === UserRole.CUSTOMER && booking.customerId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized access to booking details");
  }

  if (role === UserRole.TECHNICIAN) {
    const profile = await getTechnicianProfileOrThrow(userId);
    if (booking.technicianId !== profile.id) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access Denied: Resource identity mismatch");
    }
  }
  return booking;
};

const updateBookingStateByTechnician = async (
  userId: string,
  bookingId: string,
  targetStatus: BookingStatus,
): Promise<Booking> => {
  const profile = await getTechnicianProfileOrThrow(userId, "Technician credentials context missing");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, isDeleted: false },
  });
  if (!booking || booking.technicianId !== profile.id) {
    throw new ApiError(httpStatus.NOT_FOUND, "No booking context discovered matching assignment metrics");
  }

  if (targetStatus === "ACCEPTED" || targetStatus === "DECLINED") {
    if (booking.status !== "REQUESTED") {
      throw new ApiError(httpStatus.BAD_REQUEST, `Cannot shift booking state to ${targetStatus} from ${booking.status}`);
    }
  }

  if (targetStatus === "IN_PROGRESS" && booking.status !== "PAID") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot move to in-progress state: Order payment requirement unfulfilled");
  }

  if (targetStatus === "COMPLETED" && booking.status !== "IN_PROGRESS") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot complete job: Service execution must be marked in-progress first");
  }

  if (targetStatus === "CANCELLED" || targetStatus === "DECLINED") {
    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: targetStatus },
      });
      if (booking.slotId) {
        await tx.slot.update({
          where: { id: booking.slotId },
          data: { booking: { disconnect: true } },
        });
      }
      return b;
    });
    return updated;
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
    throw new ApiError(httpStatus.NOT_FOUND, "Target consumer booking record not found");
  }

  const nonCancellableStatuses: BookingStatus[] = [
    "PAID", "IN_PROGRESS", "COMPLETED", "DECLINED", "CANCELLED",
  ];
  if (nonCancellableStatuses.includes(booking.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Cancellation not allowed: Booking is currently ${booking.status}.`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
    if (booking.slotId) {
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { booking: { disconnect: true } },
      });
    }
    return b;
  });

  return result;
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingDetails,
  updateBookingStateByTechnician,
  cancelBookingByCustomer,
};
