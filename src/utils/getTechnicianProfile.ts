import { prisma } from "../lib/prisma";
import { ApiError } from "./ApiError";
import httpStatus from "http-status";

/**
 * Helper to fetch a technician profile by userId.
 * Throws a 404 ApiError if the profile does not exist.
 */
export const getTechnicianProfileOrThrow = async (userId: string, errorMessage = "Technician profile not found.") => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessage);
  }

  return profile;
};
