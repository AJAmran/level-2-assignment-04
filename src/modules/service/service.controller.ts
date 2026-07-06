import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ServiceService } from "./service.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createService = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await ServiceService.createService(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Service offering registered successfully",
    data: result,
  });
});

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    categoryId: req.query.categoryId as string,
    minPrice: req.query.minPrice as string,
    maxPrice: req.query.maxPrice as string,
  };

  const result = await ServiceService.getAllServices(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Services Fetch Successfully",
  });
});

export const ServiceController = {
  createService,
  getAllServices,
};
