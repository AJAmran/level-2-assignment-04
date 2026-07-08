import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { ServiceRoutes } from "../modules/service/service.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { TechniciansPublicRoutes, TechnicianOperationsRoutes } from "../modules/technician/technician.route";

const router = Router();

/** Describes a module route registration pair */
interface ModuleRoute {
  path: string;
  route: Router;
}

/** All feature modules mapped to their URL prefixes */
const moduleRoutes: ModuleRoute[] = [
  { path: "/auth", route: AuthRoutes },
  { path: "/categories", route: CategoryRoutes },
  { path: "/services", route: ServiceRoutes },
  { path: "/bookings", route: BookingRoutes },
  { path: "/payments", route: PaymentRoutes },
  { path: "/reviews", route: ReviewRoutes },
  { path: "/admin", route: AdminRoutes },
  /** Public technician listing/profile routes */
  { path: "/technicians", route: TechniciansPublicRoutes },
  /** Authenticated technician operation routes (profile, availability, bookings) */
  { path: "/technician", route: TechnicianOperationsRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export const globalRouter = router;
