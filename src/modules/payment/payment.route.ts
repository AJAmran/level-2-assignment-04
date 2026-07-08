/**
 * Payment module routes.
 * - POST  /create   – Initiate an SSLCommerz payment session (customer-only)
 * - POST  /confirm  – SSLCommerz webhook / redirect callback
 * - GET   /         – List logged-in customer's payments
 * - GET   /:id      – Get a single payment's details (customer-only)
 */
import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const router = Router();

router.post(
  "/create",
  authGuard(UserRole.CUSTOMER),
  validateRequest(GlobalValidations.createPaymentSchema),
  paymentController.checkout,
);
router.post("/confirm", paymentController.sslWebhook);
router.get(
  "/",
  authGuard(UserRole.CUSTOMER),
  paymentController.getUserPayments,
);
router.get(
  "/:id",
  authGuard(UserRole.CUSTOMER),
  paymentController.getPaymentDetails,
);

export const PaymentRoutes = router;
