import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { ReviewController } from "./review.controller";

const router = Router();

router.post("/", authGuard(UserRole.CUSTOMER), ReviewController.createReview);

export const ReviewRoutes = router;
