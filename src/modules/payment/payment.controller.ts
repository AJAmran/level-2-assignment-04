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
    message: "Payment gateway initiated successfully. Redirect user to the returned URL.",
    data: { gatewayUrl },
  });
});

const sslWebhook = catchAsync(async (req: Request, res: Response) => {
  const { bookingId, tranId, status } = req.query;
    const valId: string | undefined = req.body?.val_id;

  await PaymentService.handleWebhookNotification(
    bookingId as string,
    tranId as string,
    status as string,
    valId,
  );

  const paymentStatus = status === "success" ? "Payment successful" : "Payment failed or cancelled";

  sendResponse(res, {
    statusCode: status === "success" ? httpStatus.OK : httpStatus.PAYMENT_REQUIRED,
    success: status === "success",
    message: paymentStatus,
    data: { bookingId, status },
  });
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await PaymentService.getUserPayments(userId, page, limit);
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
