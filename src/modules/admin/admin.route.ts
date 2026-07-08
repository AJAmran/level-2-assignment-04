/**
 * Admin module routes.
 * All routes are guarded by ADMIN role.
 * - GET    /users         – List all users (paginated)
 * - PATCH  /users/:id     – Activate or ban a user
 * - GET    /bookings      – List all bookings (paginated)
 * - GET    /categories    – List all categories
 * - POST   /categories    – Create a new category
 */
import { Router } from "express";
import { AdminController } from "./admin.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { GlobalValidations } from "../../utils/validations";

const router = Router();

router.get("/users", authGuard(UserRole.ADMIN), AdminController.getAllUsers);
router.patch("/users/:id", authGuard(UserRole.ADMIN), validateRequest(GlobalValidations.updateUserStatusSchema), AdminController.updateUserStatus);
router.get("/bookings", authGuard(UserRole.ADMIN), AdminController.getAllBookings);
router.get("/categories", authGuard(UserRole.ADMIN), AdminController.getAllCategories);
router.post("/categories", authGuard(UserRole.ADMIN), validateRequest(GlobalValidations.createCategorySchema), AdminController.createCategory);

export const AdminRoutes = router;
