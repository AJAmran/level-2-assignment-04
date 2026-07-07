import axios from "axios";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

const initiatePayment = async (bookingId: string, userId: string): Promise<string> => {
  // 1. Fetch matching Booking with attached Service details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, customerId: userId },
    include: { service: true, customer: true },
  });

  if (!booking) throw new ApiError(httpStatus.NOT_FOUND, "Target booking context data missing.");

  const transactionId = `TXN_${Date.now()}`;

  // 2. Format payment payload matching SSLCommerz dynamic expectations
  const paymentData = new URLSearchParams({
    store_id: config.storeId,
    store_passwd: config.storePasswd,
    total_amount: booking.service.price.toString(),
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${config.app_url}/api/v1/payments/webhook?bookingId=${booking.id}&tranId=${transactionId}&status=success`,
    fail_url: `${config.app_url}/api/v1/payments/webhook?bookingId=${booking.id}&tranId=${transactionId}&status=fail`,
    cancel_url: `${config.app_url}/api/v1/payments/webhook?bookingId=${booking.id}&tranId=${transactionId}&status=cancel`,
    cus_name: booking.customer.email.split("@")[0] || "Customer",
    cus_email: booking.customer.email,
    cus_add1: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: "01700000000",
  });

  // 3. Request Sandbox Redirect URI
  const response = await axios.post(
    "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    paymentData.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  console.log(response.data);
  // 4. Create base payment reference in local database
  if (response.data?.status === "SUCCESS") {
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        transactionId,
        amount: booking.service.price,
        provider: "SSLCOMMERZ",
        status: "PENDING",
      },
    });
    return response.data.GatewayPageURL;
  }

  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "SSLCommerz generation tracking handshake dropped.");
};



export const PaymentService = { initiatePayment };
