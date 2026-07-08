import { z } from "zod";

const createBookingSchema = z.object({
  serviceId: z.string().uuid("Service ID must be a valid UUID"),
  scheduledTime: z.string().datetime("Scheduled time must be a valid ISO 8601 datetime"),
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
});

const updateServiceSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters").optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  categoryId: z.string().uuid("Category ID must be a valid UUID").optional(),
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

const updateAvailabilitySchema = z.object({
  slots: z.array(z.string().datetime("Each slot must be a valid ISO datetime string")),
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

export const GlobalValidations = {
  createBookingSchema,
  createCategorySchema,
  createServiceSchema,
  createReviewSchema,
  updateTechnicianProfileSchema,
  updateAvailabilitySchema,
  updateBookingStatusSchema,
  updateUserStatusSchema,
  createPaymentSchema,
  updateServiceSchema,
};
