import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ServiceService } from "./service.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { pick } from "../../utils/pick";

const createService = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.createService(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Service created successfully",
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
    message: "Services fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getServiceById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string") throw new Error("Invalid service id");
  const result = await ServiceService.getServiceById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service fetched successfully",
    data: result,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const serviceId = req.params.id;
  if (typeof serviceId !== "string") throw new Error("Invalid service id");
  const result = await ServiceService.updateService(serviceId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service updated successfully",
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const serviceId = req.params.id;
  if (typeof serviceId !== "string") throw new Error("Invalid service id");
  const result = await ServiceService.deleteService(serviceId);

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
  getServiceById,
  updateService,
  deleteService,
};
