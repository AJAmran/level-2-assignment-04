import { Prisma, Service } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { TServiceFilterableFields } from "./service.interface";

const createService = async (
  technicanId: string,
  payload: Omit<
    Service,
    "id" | "technicianId" | "isDeleted" | "isDeleted" | "updatedAt"
  >,
): Promise<Service> => {
  //verify target Category existence
  const categoryExists = await prisma.service.findUnique({
    where: { id: payload.categoryId },
  });

  if (!categoryExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Invalid mapping context: Category not found",
    );
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: {
      userId: technicanId,
    },
  });

  if (!profile) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Technician reference matrix context missing",
    );
  }

  return await prisma.service.create({
    data: {
      name: payload.name,
      price: payload.price,
      categoryId: payload.categoryId,
      technicianId: profile.id,
    },
  });
};

const getAllServices = async (
  filters: TServiceFilterableFields,
): Promise<Service[]> => {
  const { search, categoryId, minPrice, maxPrice } = filters;
  const whereConditions: Prisma.ServiceWhereInput = { isDeleted: false };

  if (search) {
    whereConditions.OR = [{ name: { contains: search, mode: "insensitive" } }];
  }

  if (categoryId) {
    whereConditions.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    whereConditions.price = {};
    if (minPrice) {
      whereConditions.price.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      whereConditions.price.lte = parseFloat(maxPrice);
    }
  }

  return await prisma.service.findMany({
    where: whereConditions,
    include: {
      category: true,
      technician: {
        include: {
          user: {
            select: { id: true, email: true, status: true },
          },
        },
      },
    },
    orderBy: { price: "asc" },
  });
};

export const ServiceService = {
  createService,
  getAllServices,
};
