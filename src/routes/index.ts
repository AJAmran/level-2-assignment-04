import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";

const router = Router();

interface ModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: ModuleRoute[] = [{ path: "/auth", route: AuthRoutes }];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export const globalRouter = router;
