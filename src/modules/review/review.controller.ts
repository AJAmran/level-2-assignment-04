import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

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

export const ReviewController = { createReview };
