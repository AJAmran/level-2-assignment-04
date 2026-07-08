/**
 * Type definitions for the booking module.
 *
 * Defines the shape of request payloads used in booking creation
 * and status update operations.
 */

import { BookingStatus } from "../../../generated/prisma/client";

/** Payload for creating a new booking. */
export type TCreateBookingPayload = {
  serviceId: string;
  scheduledTime: string;
  address: string;
  phone: string;
};

/** Payload for updating a booking's status (technician/admin). */
export type TUpdateBookingStatusPayload = {
  status: Extract<BookingStatus, "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "COMPLETED">;
};
