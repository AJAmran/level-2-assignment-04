import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ServiceService } from "./service.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { pick } from "../../utils/pick";

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
  const filters = pick(req.query, ["search", "categoryId", "minPrice", "maxPrice"]) as any;
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await ServiceService.getAllServices(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Services Fetch Successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const serviceId = req.params.id as string;
  const result = await ServiceService.updateService(userId, serviceId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service updated successfully",
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const serviceId = req.params.id as string;
  const result = await ServiceService.deleteService(userId, serviceId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service deleted successfully",
    data: result,
  });
});

export const ServiceController = {
  createService,
  getAllServices,
  updateService,
  deleteService,
};
