import { prisma } from "../lib/prisma";
import { ApiError } from "./ApiError";
import httpStatus from "http-status";

export const getTechnicianProfileOrThrow = async (userId: string, errorMessage = "Technician profile not found.") => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessage);
  }

  return profile;
};
