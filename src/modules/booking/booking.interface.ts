import { BookingStatus } from "../../../generated/prisma/client";

export type TCreateBookingPayload = {
  serviceId: string;
  scheduledTime: string;
  address: string;
  phone: string;
};

export type TUpdateBookingStatusPayload = {
  status: Extract<BookingStatus, "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "COMPLETED">;
};
