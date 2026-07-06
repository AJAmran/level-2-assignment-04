import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { ServiceRoutes } from "../modules/service/service.route";

const router = Router();

interface ModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: ModuleRoute[] = [
  { path: "/auth", route: AuthRoutes },
  { path: "/category", route: CategoryRoutes },
  { path: "/service", route: ServiceRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export const globalRouter = router;
