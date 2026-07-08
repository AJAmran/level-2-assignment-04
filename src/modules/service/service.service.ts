import { Prisma, Service } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { TServiceFilterableFields } from "./service.interface";
import { paginationHelpers } from "../../utils/paginationHelper";
import { getTechnicianProfileOrThrow } from "../../utils/getTechnicianProfile";

/**
 * Create a new service offering.
 */
const createService = async (
  technicianId: string,
  payload: Omit<Service, "id" | "technicianId" | "isDeleted" | "updatedAt" | "createdAt">,
): Promise<Service> => {
  //verify target Category existence
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!categoryExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Category not found.",
    );
  }

  const profile = await getTechnicianProfileOrThrow(
    technicianId,
    "Technician profile not found. Please complete your profile setup first.",
  );

  return await prisma.service.create({
    data: {
      name: payload.name,
      price: payload.price,
      categoryId: payload.categoryId,
      technicianId: profile.id,
    },
  });
};

/**
 * Retrieve all non-deleted services with optional filters.
 * Supports search by name, category ID, and price range.
 */
const getAllServices = async (
  filters: TServiceFilterableFields,
  options: any,
) => {
  const { search, categoryId, minPrice, maxPrice } = filters;
  const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);
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

  const result = await prisma.service.findMany({
    where: whereConditions,
    skip,
    take: limit,
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
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.service.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

/**
 * Update a service offering.
 * Ensures the requesting technician owns the service before updating.
 */
const updateService = async (
  userId: string,
  serviceId: string,
  payload: Partial<Pick<Service, "name" | "price" | "categoryId">>,
): Promise<Service> => {
  const profile = await getTechnicianProfileOrThrow(userId);

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isDeleted: false },
  });

  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found.");
  }

  if (service.technicianId !== profile.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "You do not have permission to update this service.");
  }

  return await prisma.service.update({
    where: { id: serviceId },
    data: payload,
  });
};

/**
 * Soft-delete a service offering.
 * Ensures the requesting technician owns the service before marking it deleted.
 */
const deleteService = async (
  userId: string,
  serviceId: string,
): Promise<Service> => {
  const profile = await getTechnicianProfileOrThrow(userId);

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isDeleted: false },
  });

  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found.");
  }

  if (service.technicianId !== profile.id) {
    throw new ApiError(httpStatus.FORBIDDEN, "You do not have permission to delete this service.");
  }

  return await prisma.service.update({
    where: { id: serviceId },
    data: { isDeleted: true },
  });
};

export const ServiceService = {
  createService,
  getAllServices,
  updateService,
  deleteService,
};
