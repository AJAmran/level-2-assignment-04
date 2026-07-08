/**
 * Admin module business logic.
 * Handles user management, platform-wide booking queries, and category CRUD.
 */
import { prisma } from "../../lib/prisma";

type CategoryCreatePayload = {
  name: string;
  slug: string;
};

/** Retrieve a paginated list of all users ordered by creation date descending. */
const getAllUsers = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);
  return { users, total, page, limit };
};

/** Update a user's status (ACTIVE or BANNED). Throws if the user does not exist. */
const updateUserStatus = async (id: string, status: "ACTIVE" | "BANNED") => {
  // Ensure the user actually exists before updating
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error("User not found");
  }
  return await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  });
};

/** Retrieve a paginated list of all bookings with related customer, technician, and service data. */
const getAllBookings = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true } },
        technician: {
          select: {
            id: true,
            user: { select: { name: true, email: true } },
          },
        },
        service: { select: { id: true, name: true, price: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count(),
  ]);
  return { bookings, total, page, limit };
};

/** Retrieve all categories ordered alphabetically by name. */
const getAllCategories = async () => {
  return await prisma.category.findMany({ orderBy: { name: "asc" } });
};

/** Create a new category with the given name and slug. */
const createCategory = async (payload: CategoryCreatePayload) => {
  return await prisma.category.create({
    data: {
      name: payload.name,
      slug: payload.slug,
    },
  });
};

export const AdminService = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
  getAllCategories,
  createCategory,
};

