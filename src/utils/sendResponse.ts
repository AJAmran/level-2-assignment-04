import { Response } from "express";

/** Pagination metadata included in paginated list responses */
export interface IMeta {
  page: number;
  limit: number;
  total: number;
}

/** Generic response envelope shape */
export interface IResponse<T, M = IMeta> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: M;
}

/** Sends a standardized JSON response with the given status code and payload */
export const sendResponse = <T, M = IMeta>(
  res: Response,
  { success, statusCode, message, data, meta }: IResponse<T, M>,
) => {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
    meta,
  });
};
