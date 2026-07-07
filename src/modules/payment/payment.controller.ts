import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const checkout = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { bookingId } = req.body;

  const gatewayUrl = await PaymentService.initiatePayment(bookingId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment gateway initiated successfully",
    data: gatewayUrl,
  });
});

const sslWebhook = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, tranId, status } = req.query;

  await PaymentService.handleWebhookNotification(
    bookingId as string,
    tranId as string,
    status as string,
    req.body,
  );

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (status === "success") {
    res.redirect(`${frontendUrl}/dashboard/bookings?payment=success`);
  } else {
    res.redirect(`${frontendUrl}/dashboard/bookings?payment=failed`);
  }
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await PaymentService.getUserPayments(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const paymentId = req.params.id as string;
  const result = await PaymentService.getPaymentDetails(userId, paymentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment details retrieved successfully",
    data: result,
  });
});

export const paymentController = {
  checkout,
  sslWebhook,
  getUserPayments,
  getPaymentDetails,
};
