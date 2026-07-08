/**
 * Booking service layer.
 *
 * Contains all business logic for booking operations:
 * - Creating bookings with service validation
 * - Retrieving bookings with role-based filtering
 * - Updating booking statuses via a state machine
 * - Handling customer-initiated cancellations
 */

import {
  Booking,
  BookingStatus,
  UserRole,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

/**
 * Create a new booking for a customer.
 *
 * Validates that the selected service exists and is not deleted,
 * then creates a booking in 'REQUESTED' status linked to the service's technician.
 *
 * @param customerId - The authenticated customer's ID.
 * @param payload    - The booking payload containing `serviceId` and `scheduledTime`.
 * @returns The created booking record.
 * @throws ApiError 404 if the service is not found.
 */
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

/**
 * Retrieve bookings for the authenticated user.
 *
 * - Admins see all non-deleted bookings.
 * - Customers see only their own bookings.
 * - Technicians see bookings assigned to them (resolved via their profile).
 *
 * @param userId - The authenticated user's ID.
 * @param role   - The authenticated user's role.
 * @returns An array of matching bookings with related customer, service, and technician data.
 * @throws ApiError 404 if a technician profile is not found.
 */
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

/**
 * Retrieve detailed information for a single booking.
 *
 * Enforces access control:
 * - Customers can only view their own bookings.
 * - Technicians can only view bookings assigned to them.
 * - Admins have unrestricted access.
 *
 * @param bookingId - The target booking ID.
 * @param userId    - The authenticated user's ID.
 * @param role      - The authenticated user's role.
 * @returns The booking record with customer and service relations.
 * @throws ApiError 404 if the booking is not found.
 * @throws ApiError 403 if the user is not authorized to view the booking.
 */
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

/**
 * Transition a booking to a new status (technician/admin operation).
 *
 * Enforces a state machine with the following rules:
 * - REQUESTED  → ACCEPTED | DECLINED
 * - PAID       → IN_PROGRESS
 * - IN_PROGRESS → COMPLETED
 *
 * @param userId       - The authenticated technician's user ID.
 * @param bookingId    - The target booking ID.
 * @param targetStatus - The desired new status.
 * @returns The updated booking record.
 * @throws ApiError 404 if the technician profile or booking is not found/mismatched.
 * @throws ApiError 400 if the requested state transition is invalid.
 */
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

/**
 * Cancel a booking on behalf of the owning customer.
 *
 * Only bookings in 'REQUESTED' or 'ACCEPTED' status can be cancelled.
 * Bookings in 'PAID', 'IN_PROGRESS', 'COMPLETED', 'DECLINED', or 'CANCELLED'
 * status are considered non-cancellable.
 *
 * @param userId    - The authenticated customer's user ID.
 * @param bookingId - The target booking ID.
 * @returns The updated booking record with status set to 'CANCELLED'.
 * @throws ApiError 404 if the booking is not found or doesn't belong to the customer.
 * @throws ApiError 400 if the booking is in a non-cancellable state.
 */
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
