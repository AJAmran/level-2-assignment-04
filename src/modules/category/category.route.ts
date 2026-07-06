import { Router } from "express";
import { categoryController } from "./category.controller";
import { authGuard } from "../../middlewares/authGuard";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.post("/", authGuard(UserRole.ADMIN), categoryController.createCategory);

export const CategoryRoutes = router;
