import { Router } from "express";

const router = Router();

const moduleRoutes = [
  // Future operational domain module routers will be injected here dynamically
  // { path: '/auth', route: AuthRoutes }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export const globalRouter = router;