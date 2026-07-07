import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { ReviewController } from "./review.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const router = Router();
router.get("/technician/:technicianId", ReviewController.getTechnicianReviews);
router.post("/", authGuard(UserRole.CUSTOMER), validateRequest(GlobalValidations.createReviewSchema), ReviewController.createReview);

export const ReviewRoutes = router;
