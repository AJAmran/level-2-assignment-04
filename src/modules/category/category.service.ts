/**
 * Category module business logic.
 * Handles category creation (with duplicate-name guard) and listing.
 */
import { Category } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

/**
 * Create a new category.
 * Rejects duplicate names and auto-generates a URL-safe slug.
 */
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

/** Retrieve all categories ordered alphabetically by name. */
const getAllCategories = async (): Promise<Category[]> => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories
};
