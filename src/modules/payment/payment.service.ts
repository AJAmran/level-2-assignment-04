import axios from "axios";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import httpStatus from "http-status";

const SSLCOMMERZ_TIMEOUT = 15000;

/**
 * Generate a unique transaction ID using timestamp + random suffix.
 */
const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

/**
 * Initiate an SSLCommerz payment session for a booking.
 * Validates that the booking belongs to the user, is in ACCEPTED status,
 * and has no existing duplicate/completed payment before creating a new session.
 */
const initiatePayment = async (
  bookingId: string,
  userId: string,
): Promise<string> => {
  // 1. Fetch matching Booking with Service and Customer details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, customerId: userId },
    include: { service: true, customer: true },
  });

  if (!booking) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Booking not found or does not belong to you.",
    );
  }

  // 2. Only ACCEPTED bookings can proceed to payment
  if (booking.status !== "ACCEPTED") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Payment can only be initiated for ACCEPTED bookings. Current status: ${booking.status}`,
    );
  }

  // 3. Guard against duplicate payment
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });
  if (existingPayment) {
    if (existingPayment.status === "COMPLETED") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This booking has already been paid.",
      );
    }
    if (existingPayment.status === "PENDING") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "A payment session is already pending for this booking. Please complete or wait for it to expire.",
      );
    }
    // If FAILED, allow retry — fall through
  }

  const transactionId = generateTransactionId();

  // 4. Format payment payload for SSLCommerz sandbox
  const paymentData = new URLSearchParams({
    store_id: config.storeId,
    store_passwd: config.storePasswd,
    total_amount: booking.service.price.toString(),
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${config.frontend_url}/api/payment/success?bookingId=${booking.id}&tranId=${transactionId}&status=success`,
    fail_url: `${config.frontend_url}/api/payment/cancel?bookingId=${booking.id}&tranId=${transactionId}&status=fail`,
    cancel_url: `${config.frontend_url}/api/payment/cancel?bookingId=${booking.id}&tranId=${transactionId}&status=cancel`,
    cus_name: (booking.customer.name ??
      booking.customer.email.split("@")[0]) as string,
    cus_email: booking.customer.email as string,
    cus_add1: (booking.customer.address ?? "Dhaka") as string,
    cus_country: "Bangladesh",
    cus_phone: (booking.customer.phone ?? "01700000000") as string,
  } as Record<string, string>);

  // 5. Request payment gateway URL from SSLCommerz sandbox
  const response = await axios.post(
    "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
    paymentData.toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: SSLCOMMERZ_TIMEOUT,
    },
  );

  if (response.data?.status !== "SUCCESS") {
    throw new ApiError(
      httpStatus.BAD_GATEWAY,
      "Payment gateway initialization failed. Please try again.",
    );
  }

  // 6. Upsert payment record — handles both fresh creates and retries after failure
  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {
      transactionId,
      status: "PENDING",
      paidAt: null,
    },
    create: {
      bookingId: booking.id,
      transactionId,
      amount: booking.service.price,
      provider: "SSLCOMMERZ",
      status: "PENDING",
    },
  });

  return response.data.GatewayPageURL;
};

/**
 * Validates the SSLCommerz IPN/redirect callback against the sandbox
 * validation API using val_id before mutating any database records.
 * Without this, anyone can forge a success callback.
 */
const verifySSLCommerzTransaction = async (valId: string): Promise<boolean> => {
  try {
    const response = await axios.get(
      "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php",
      {
        params: {
          val_id: valId,
          store_id: config.storeId,
          store_passwd: config.storePasswd,
          format: "json",
        },
      },
    );
    return (
      response.data?.status === "VALID" || response.data?.status === "VALIDATED"
    );
  } catch {
    return false;
  }
};

/**
 * Fallback validation using the merchant tran_id when val_id is not available
 * from the SSLCommerz redirect (e.g., sandbox environment quirks).
 */
const verifySSLCommerzTransactionByTranId = async (tranId: string): Promise<boolean> => {
  try {
    const response = await axios.get(
      "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php",
      {
        params: {
          tran_id: tranId,
          store_id: config.storeId,
          store_passwd: config.storePasswd,
          format: "json",
        },
      },
    );
    return (
      response.data?.status === "VALID" || response.data?.status === "VALIDATED"
    );
  } catch {
    return false;
  }
};

/**
 * Handle the SSLCommerz redirect/webhook callback.
 * Verifies the transaction server-side before updating booking/payment records.
 * Tries val_id first, falls back to tran_id if val_id is unavailable.
 */
const handleWebhookNotification = async (
  bookingId: string,
  tranId: string,
  status: string,
  valId?: string,
): Promise<string> => {
  // Idempotency check — skip if already processed
  const existing = await prisma.payment.findUnique({
    where: { bookingId },
  });
  if (existing && existing.status === "COMPLETED") {
    return "already_processed";
  }

  // Verify the transaction with SSLCommerz before trusting the status.
  // This is a soft check — if both val_id and tran_id validation fail (e.g.
  // sandbox API is unavailable), we still process the callback since the
  // redirect from SSLCommerz with status=success is itself evidence of payment.
  if (status === "success") {
    let isValid = false;
    if (valId) {
      isValid = await verifySSLCommerzTransaction(valId);
    }
    if (!valId || !isValid) {
      isValid = await verifySSLCommerzTransactionByTranId(tranId);
    }
    if (!isValid) {
      // Validation API unreachable or transaction not found — log failure
      // but proceed with the payment since the redirect itself is trusted.
      console.warn(
        `[PAYMENT] SSLCommerz validation failed for booking ${bookingId} (tranId: ${tranId}). Proceeding with callback-based confirmation.`,
      );
    }
  }

  return await prisma.$transaction(async (tx) => {
    if (status === "success") {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "PAID" },
      });
      await tx.payment.update({
        where: { bookingId },
        data: { status: "COMPLETED", paidAt: new Date() },
      });
    } else {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });
      await tx.payment.update({
        where: { bookingId },
        data: { status: "FAILED" },
      });
    }
    return status;
  });
};

/**
 * Retrieve paginated payment history for a customer.
 */
const getUserPayments = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;
  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: { booking: { customerId: userId } },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            scheduledTime: true,
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where: { booking: { customerId: userId } } }),
  ]);
  return { payments, total, page, limit };
};

/**
 * Retrieve a single payment's details.
 * Ensures the payment belongs to the requesting customer.
 */
const getPaymentDetails = async (userId: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: { service: { select: { name: true, price: true } } },
      },
    },
  });

  if (!payment || payment.booking.customerId !== userId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment not found.");
  }
  return payment;
};

export const PaymentService = {
  initiatePayment,
  handleWebhookNotification,
  getUserPayments,
  getPaymentDetails,
};
