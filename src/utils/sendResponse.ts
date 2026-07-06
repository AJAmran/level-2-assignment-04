import { Response } from "express";

export interface IMeta {
  page: number;
  limit: number;
  total: number;
}

export interface IResponse<T, M = IMeta> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: M;
}

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
