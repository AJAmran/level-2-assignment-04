import { Review } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

const createReview = async (
  customerId: string,
  payload: Pick<Review, "bookingId" | "rating" | "comment">,
) => {
  if (payload.rating < 1 || payload.rating > 5) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Validation Error: Rating metric score must rest cleanly between 1 and 5",
    );
  }

  //Fetch target booking
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId, isDeleted: false },
  });

  if (!booking || booking.customerId !== customerId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Target appointment instance not found for this customer profile",
    );
  }

  //state validations
  if (booking.status !== "COMPLETED") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Verification Error: Feedback can only be submitted for COMPLETED jobs",
    );
  }

  return await prisma.$transaction(async (tx) => {
    // Check for existing review INSIDE the transaction to prevent race conditions
    const existingReview = await tx.review.findUnique({
      where: { bookingId: payload.bookingId },
    });
    if (existingReview) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "A review has already been submitted for this booking.",
      );
    }

    const reviewResult = await tx.review.create({
      data: {
        bookingId: payload.bookingId,
        customerId,
        technicianId: booking.technicianId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    // Recalculate and update the technician's average rating
    const aggregateData = await tx.review.aggregate({
      where: { technicianId: booking.technicianId },
      _avg: { rating: true },
    });

    const newAverageRating = aggregateData._avg.rating ?? 0.0;

    await tx.technicianProfile.update({
      where: { id: booking.technicianId },
      data: { rating: parseFloat(newAverageRating.toFixed(1)) },
    });

    return reviewResult;
  });
};

const getTechnicianReviews = async (
  technicianProfileId: string,
): Promise<Review[]> => {
  return await prisma.review.findMany({
    where: { technicianId: technicianProfileId },
    include: {
      customer: {
        select: { id: true, email: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const ReviewService = {
  createReview,
  getTechnicianReviews,
};
