import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const checkout = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {bookingId} = req.body;

    const gatewayUrl = await PaymentService.initiatePayment(bookingId, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment gateway initiated successfully",
        data: gatewayUrl,
    });
});


export const paymentController = {
    checkout
}