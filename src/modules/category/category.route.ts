import { Router } from "express";
import { categoryController } from "./category.controller";

const router = Router();

// Public: anyone can browse categories
router.get("/", categoryController.getAllCategories);

export const CategoryRoutes = router;
