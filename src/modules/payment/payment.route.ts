import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";
import { validateParams, validateQuery, validateRequest } from "../../middlewares/validateRequest";
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
  validateQuery(GlobalValidations.paginationSchema),
  paymentController.getUserPayments,
);
router.get(
  "/:id",
  authGuard(UserRole.CUSTOMER),
  validateParams(GlobalValidations.uuidParamSchema),
  paymentController.getPaymentDetails,
);

export const PaymentRoutes = router;
