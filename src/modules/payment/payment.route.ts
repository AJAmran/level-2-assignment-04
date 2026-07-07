import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/checkout",
  authGuard(UserRole.CUSTOMER),
  paymentController.checkout,
);
router.post("/webhook", paymentController.sslWebhook);

export const PaymentRoutes = router;
