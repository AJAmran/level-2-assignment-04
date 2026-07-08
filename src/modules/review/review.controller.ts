/**
 * Review module controllers.
 * Handles HTTP request/response for creating and fetching reviews.
 */
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ApiError } from "../../utils/ApiError";

/** Submit a review for a completed booking and trigger rating aggregation. */
const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const result = await ReviewService.createReview(customerId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message:
      "Customer feedback submitted and profile matrix aggregated successfully",
    data: result,
  });
});

/** Retrieve all public reviews for a given technician profile. */
const getTechnicianReviews = catchAsync(async (req: Request, res: Response) => {
  const technicianId = Array.isArray(req.params.technicianId)
    ? req.params.technicianId[0]
    : req.params.technicianId;

  if (!technicianId) {
     throw new ApiError(httpStatus.BAD_REQUEST, "Technician ID is required")
  }

  const result = await ReviewService.getTechnicianReviews(technicianId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician public feedback streams queried successfully",
    data: result,
  });
});

export const ReviewController = { createReview, getTechnicianReviews };
