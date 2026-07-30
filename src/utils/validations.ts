import { z } from "zod";

const createBookingSchema = z.object({
  serviceId: z.string().uuid("Service ID must be a valid UUID"),
  technicianId: z.string().uuid("Technician ID must be a valid UUID"),
  slotId: z.string().uuid("Slot ID must be a valid UUID"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(7, "Phone number must be at least 7 characters"),
});

const createCategorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters"),
  slug: z.string().min(3, "Category slug must be at least 3 characters"),
});

const createServiceSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters"),
  price: z.number().positive("Price must be a positive number"),
  categoryId: z.string().uuid("Category ID must be a valid UUID"),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
});

const updateServiceSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters").optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  categoryId: z.string().uuid("Category ID must be a valid UUID").optional(),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
});

const createReviewSchema = z.object({
  bookingId: z.string().uuid("Booking ID must be a valid UUID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(5, "Review comment must be at least 5 characters"),
});

const updateTechnicianProfileSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  experience: z.number().min(0, "Experience cannot be negative").optional(),
});

const createSlotsSchema = z.object({
  slots: z.array(
    z.object({
      startTime: z.string().datetime("Start time must be a valid ISO datetime"),
      endTime: z.string().datetime("End time must be a valid ISO datetime"),
    }),
  ).min(1, "At least one slot is required"),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"] as const, {
    message: "Status must be one of ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED",
  }),
});

const createPaymentSchema = z.object({
  bookingId: z.string().uuid("Booking ID must be a valid UUID"),
});

const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BANNED"] as const, {
    message: "Status must be either ACTIVE or BANNED",
  }),
});

const linkServiceSchema = z.object({
  serviceId: z.string().uuid("Service ID must be a valid UUID"),
});

export const GlobalValidations = {
  createBookingSchema,
  createCategorySchema,
  createServiceSchema,
  createReviewSchema,
  updateTechnicianProfileSchema,
  createSlotsSchema,
  updateBookingStatusSchema,
  updateUserStatusSchema,
  createPaymentSchema,
  updateServiceSchema,
  linkServiceSchema,
};
