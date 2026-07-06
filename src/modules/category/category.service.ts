import { Category } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

const createCategory = async (
  payload: Pick<Category, "name">,
): Promise<Category> => {
  const isCategoryExist = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (isCategoryExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Category creation failed: Name already exists",
    );
  }

  const slug = payload.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return await prisma.category.create({
    data: {
      name: payload.name,
      slug,
    },
  });
};

const getAllCategories = async (): Promise<Category[]> => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories
};
