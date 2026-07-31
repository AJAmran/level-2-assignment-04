import { z } from "zod";

const createBookingSchema = z.object({
  serviceId: z.string().uuid("Service ID must be a valid UUID"),
  technicianId: z.string().uuid("Technician ID must be a valid UUID").optional(),
  slotId: z.string().uuid("Slot ID must be a valid UUID").optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .regex(/^[+\d][\d\s-]*$/, "Phone number contains invalid characters"),
});

const createCategorySchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters").max(100),
  slug: z
    .string()
    .min(3, "Category slug must be at least 3 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, or dashes"),
});

const createServiceSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters").max(200),
  price: z
    .number({ message: "Price must be a number" })
    .positive("Price must be a positive number")
    .max(100000, "Price seems unreasonably high"),
  categoryId: z.string().uuid("Category ID must be a valid UUID"),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
});

const updateServiceSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters").max(200).optional(),
  price: z
    .number({ message: "Price must be a number" })
    .positive("Price must be a positive number")
    .max(100000, "Price seems unreasonably high")
    .optional(),
  categoryId: z.string().uuid("Category ID must be a valid UUID").optional(),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
});

const createReviewSchema = z.object({
  bookingId: z.string().uuid("Booking ID must be a valid UUID"),
  rating: z
    .number({ message: "Rating must be a number" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().min(5, "Review comment must be at least 5 characters").max(1000),
});

const updateTechnicianProfileSchema = z.object({
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  location: z.string().max(100, "Location cannot exceed 100 characters").optional(),
  experience: z
    .number({ message: "Experience must be a number" })
    .int("Experience must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(60, "Experience cannot exceed 60 years")
    .optional(),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
});

const slotEntrySchema = z
  .object({
    startTime: z.string().datetime("Start time must be a valid ISO datetime"),
    endTime: z.string().datetime("End time must be a valid ISO datetime"),
  })
  .refine((slot) => new Date(slot.endTime) > new Date(slot.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((slot) => new Date(slot.startTime) > new Date(), {
    message: "Slot start time must be in the future",
    path: ["startTime"],
  });

const createSlotsSchema = z.object({
  slots: z.array(slotEntrySchema).min(1, "At least one slot is required").max(50, "Too many slots in one request"),
});

const updateSlotSchema = z.object({
  startTime: z.string().datetime("Start time must be a valid ISO datetime"),
  endTime: z.string().datetime("End time must be a valid ISO datetime"),
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

const paginationSchema = z.object({
  page: z.coerce
    .number({ message: "Page must be a number" })
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .default(1),
  limit: z.coerce
    .number({ message: "Limit must be a number" })
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

const uuidParamSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export const GlobalValidations = {
  createBookingSchema,
  createCategorySchema,
  createServiceSchema,
  createReviewSchema,
  updateTechnicianProfileSchema,
  createSlotsSchema,
  updateSlotSchema,
  updateBookingStatusSchema,
  updateUserStatusSchema,
  createPaymentSchema,
  updateServiceSchema,
  linkServiceSchema,
  paginationSchema,
  uuidParamSchema,
};
