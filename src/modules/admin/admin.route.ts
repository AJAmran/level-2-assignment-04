import { Router } from "express";
import { AdminController } from "./admin.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { validateParams, validateQuery, validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const router = Router();

router.get("/users", authGuard(UserRole.ADMIN), validateQuery(GlobalValidations.paginationSchema), AdminController.getAllUsers);
router.patch("/users/:id", authGuard(UserRole.ADMIN), validateParams(GlobalValidations.uuidParamSchema), validateRequest(GlobalValidations.updateUserStatusSchema), AdminController.updateUserStatus);
router.get("/bookings", authGuard(UserRole.ADMIN), validateQuery(GlobalValidations.paginationSchema), AdminController.getAllBookings);
router.get("/categories", authGuard(UserRole.ADMIN), AdminController.getAllCategories);
router.post("/categories", authGuard(UserRole.ADMIN), validateRequest(GlobalValidations.createCategorySchema), AdminController.createCategory);

export const AdminRoutes = router;
