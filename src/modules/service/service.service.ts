import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";
import { TServiceFilterableFields } from "./service.interface";
import { paginationHelpers } from "../../utils/paginationHelper";

const createService = async (
  userId: string,
  payload: { name: string; price: number; categoryId: string; image?: string },
) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!categoryExists) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found.");
  }

  return await prisma.service.create({
    data: {
      name: payload.name,
      price: payload.price,
      categoryId: payload.categoryId,
      image: payload.image,
    },
  });
};

const getAllServices = async (filters: TServiceFilterableFields, options: any) => {
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
    if (minPrice) whereConditions.price.gte = parseFloat(minPrice);
    if (maxPrice) whereConditions.price.lte = parseFloat(maxPrice);
  }

  const result = await prisma.service.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      category: true,
      technicianServices: {
        include: {
          technician: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.service.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getServiceById = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id, isDeleted: false },
    include: {
      category: true,
      technicianServices: {
        include: {
          technician: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
        },
      },
    },
  });
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found.");
  }
  return service;
};

const updateService = async (
  serviceId: string,
  payload: { name?: string; price?: number; categoryId?: string; image?: string },
) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId, isDeleted: false },
  });
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found.");
  }
  return await prisma.service.update({
    where: { id: serviceId },
    data: payload,
  });
};

const deleteService = async (serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId, isDeleted: false },
  });
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found.");
  }
  return await prisma.service.update({
    where: { id: serviceId },
    data: { isDeleted: true },
  });
};

export const ServiceService = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
