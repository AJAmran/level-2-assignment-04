import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
};

const updateUserStatus = async (id: string, status: "ACTIVE" | "BANNED") => {
  return await prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  });
};

const getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      technician: { select: { id: true, user: { select: { name: true, email: true } } } },
      service: { select: { id: true, name: true, price: true } },
    },
  });
};

const getAllCategories = async () => {
  return await prisma.category.findMany();
};

const createCategory = async (payload: any) => {
  return await prisma.category.create({
    data: payload,
  });
};

export const AdminService = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
  getAllCategories,
  createCategory,
};
