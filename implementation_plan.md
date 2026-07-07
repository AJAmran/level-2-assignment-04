# FixItNow Backend Audit & Implementation Plan

Based on a thorough review of the current codebase against `requirement.md`, here is the audit report and the proposed implementation plan to bring the project to 100% compliance.

## 🔴 1. Critical Missing Features & Non-Compliance

> [!WARNING]
> Several mandatory requirements are missing or not fully implemented. These will result in a failing grade if not addressed.

### A. Input Validation (Missing)
- **Status:** Not Implemented.
- **Issue:** Neither `zod` nor `joi` is installed in `package.json`. No validation middlewares or schemas exist for any endpoint.
- **Action:** Install `zod`, create Zod validation schemas for all incoming payloads (Register, Login, Booking, etc.), and implement a `validateRequest` middleware.

### B. Admin Credentials & Seeding (Missing)
- **Status:** Not Implemented.
- **Issue:** There is no seed script defined in `package.json` to populate the database with default Admin credentials.
- **Action:** Create `prisma/seed.ts` containing Admin credentials and add the seed command to `package.json`. Provide these credentials in the final README.

### C. Consistent Error Responses (Partial)
- **Status:** Needs Fix.
- **Issue:** `globalErrorHandler.ts` returns an array `errorDetails: [{ path, message }]`. The requirement strictly dictates an object `errorDetails: { ... }`.
- **Action:** Refactor `globalErrorHandler.ts` and `ApiError.ts` to map validation errors into a single structured object as per instructions.

## 🟡 2. Missing Modules & Endpoints

> [!IMPORTANT]
> Several role-specific route groups and endpoints described in the API Endpoints Map are entirely absent from the codebase.

### Admin Governance Operations (Missing)
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id` (Ban/Unban)
- `GET /api/admin/bookings`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- **Action:** Create an `admin` module (`admin.route.ts`, `admin.controller.ts`, `admin.service.ts`) under `src/modules/` and map these endpoints.

### Technician Public & Operations (Missing)
- `GET /api/technicians` (Public browse)
- `GET /api/technicians/:id` (Public profile view)
- `PUT /api/technician/profile` (Upsert profile)
- `PUT /api/technician/availability` (Manage slots)
- `GET /api/technician/bookings` (Technician's assigned bookings)
- `PATCH /api/technician/bookings/:id` (Advance state: ACCEPT/DECLINE/COMPLETE)
- **Action:** Create a `technician` module and map the corresponding routes. Note: Currently, booking state advancement is inside the `booking` module (`PATCH /api/v1/booking/:id/status`), which needs to be re-aligned to `/api/technician/bookings/:id` to match the required API map exactly.

### Endpoint Path Misalignments
- The requirement explicitly asks for paths like `/api/auth/me`. Currently, it is `/api/v1/auth/getme`.
- **Action:** We need to rename `/getme` to `/me` in `auth.route.ts`. We also need to decide if keeping the `/v1` prefix is acceptable or if we should strictly remove it to match `/api/...`.

## 🟢 3. Implemented Components (Needs Review/Polish)

- **Authentication:** JWT is implemented with `access` and `refresh` tokens stored in cookies. Roles are correctly assigned in `schema`.
- **Database Schema:** Prisma schema exists and is structured logically across multiple files.
- **Payments:** `sslcommerz-lts` is installed. Need to verify if the IPN webhook route is fully functional and bypasses CSRF/Auth checks correctly.

---

## User Review Required

Please review the audit findings above.

### Open Questions
1. **API Prefix:** Do you want me to remove the `/v1` from `/api/v1/...` so that the endpoints strictly match `requirement.md` (e.g., `/api/auth/register`), or is `/api/v1/auth/register` acceptable?
2. **Implementation Priority:** Would you like me to tackle the **Input Validation** and **Error Handling** first, or build the missing **Admin** and **Technician** modules?
3. **Admin Credentials:** What email and password would you like to use for the Admin seed? (I can use `admin@fixitnow.com` and a default strong password if you prefer).

Once you approve the plan and answer the questions, I will begin execution step-by-step!
