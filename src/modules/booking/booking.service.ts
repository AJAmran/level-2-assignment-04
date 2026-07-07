import { Booking } from "../../../generated/prisma/client";
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

export const BookingService = { createBooking };
