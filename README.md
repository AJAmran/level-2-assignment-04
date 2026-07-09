# FixItNow Backend

## Introduction
FixItNow is a robust, scalable backend API for a home services marketplace. It enables customers to browse and book technicians for home services like plumbing, electrical work, and cleaning, and allows technicians to manage their profiles, availability, and bookings. The platform uses SSLCommerz for secure payment processing and includes role-based access control (RBAC) for Admins, Technicians, and Customers.

## Features
- **Role-Based Access Control**: Separate flows for Customer, Technician, and Admin roles.
- **Service & Technician Directory**: Browse, filter, and search available services and technician profiles.
- **Booking Management**: Complete lifecycle from requesting a service to payment and completion.
- **Payment Integration**: Secure sandbox integration with SSLCommerz.
- **Review System**: Customers can review technicians after completed jobs.
- **Secure Authentication**: JWT-based authentication with secure cookie storage.
- **Error Handling**: Standardized error responses with specific handling for database constraint violations.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT, bcryptjs

## Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- SSLCommerz Sandbox Account

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
    Copy `.env.example` to `.env` (if provided) and fill in the following:
    ```env
    NODE_ENV=
    PORT=
    DATABASE_URL=""
    JWT_ACCESS_SECRET=""
    JWT_REFRESH_SECRET=""
    JWT_ACCESS_EXPIRES_IN=
    JWT_REFRESH_EXPIRES_IN=
    SALT_ROUNDS=
    Store_ID=""
    Store_Password=""
    APP_URL=""
    ```
4. **Run Database Migrations**:
   ```bash
   npm run prisma:migrate
   ```
5. **Seed the Database (Admin Setup)**:
   ```bash
   npm run seed
   ```
6. **Start the Development Server**:
   ```bash
   npm run dev
   ```

## Booking & Payment Workflow

```
  CUSTOMER             TECHNICIAN          SSLCOMMERZ
    |                     |                    |
    |-- POST /bookings -->|                    |     (status: REQUESTED)
    |                     |                    |
    |                     |<--- PATCH status --|     (status: ACCEPTED)
    |                     |  to "ACCEPTED"     |
    |                     |                    |
    |-- POST /payments ---|--------------------|-->  (status: PENDING)
    |   /create           |                    |     Returns GatewayPageURL
    |                     |                    |
    |-- Redirect to ------|--------------------|-->  Customer pays on
    |   SSLCommerz page   |                    |     SSLCommerz sandbox
    |                     |                    |
    |<--- Callback -------|--------------------|     POST /api/payments/confirm
    |   (success)         |                    |     Server validates with val_id
    |                     |                    |
    |   Booking: PAID ----|                    |     (status: PAID)
    |   Payment: COMPLETED|                    |
    |                     |                    |
    |                     |-- PATCH status --->|     (status: IN_PROGRESS)
    |                     |  to "IN_PROGRESS"  |
    |                     |                    |
    |                     |-- PATCH status --->|     (status: COMPLETED)
    |                     |  to "COMPLETED"    |
    |                     |                    |
    |-- POST /api/reviews-|--------------------|     (optional review)
```

**Status state machine:**

```
REQUESTED --> ACCEPTED --> PAID --> IN_PROGRESS --> COMPLETED
    |             |             |
    v             v             v
CANCELLED     DECLINED    (no refund flow)
```

### Payment Details
- **Gateway:** SSLCommerz (sandbox mode)
- **Currency:** BDT (Bangladeshi Taka)
- **Validation:** Server-side `val_id` verification before marking payment as COMPLETED
- **Retry:** If payment FAILED, customer can retry on the same booking
- **Cancellation:** Once PAID, booking cannot be cancelled (no refund endpoint implemented)

---

## API Documentation

Full detailed API documentation is available in [`api-docs.md`](./api-docs.md).

**Base URL:** `http://localhost:5000/api`

**Auth:** JWT Bearer tokens via `Authorization: Bearer <token>` header or HTTP-only cookies.

**Response Envelope:**
```json
{ "success": true, "statusCode": 200, "message": "...", "data": { ... }, "meta": { "page": 1, "limit": 10, "total": 100 } }
```

### Endpoints Overview

| Method | Route                          | Access              | Description                        |
|--------|--------------------------------|---------------------|------------------------------------|
| POST   | `/api/auth/register`           | Public              | Register new user                  |
| POST   | `/api/auth/login`              | Public              | Login                              |
| POST   | `/api/auth/refresh-token`      | Public (cookie)     | Refresh access token               |
| GET    | `/api/auth/me`                 | Authenticated       | Get current user profile           |
| GET    | `/api/categories`              | Public              | List all categories                |
| GET    | `/api/services`                | Public              | List services (with filters)       |
| POST   | `/api/services`                | TECHNICIAN          | Create service                     |
| PATCH  | `/api/services/:id`            | TECHNICIAN (owner)  | Update service                     |
| DELETE | `/api/services/:id`            | TECHNICIAN (owner)  | Soft-delete service                |
| POST   | `/api/bookings`                | CUSTOMER            | Create booking (serviceId, scheduledTime) |
| GET    | `/api/bookings`                | Authenticated       | List bookings (role-scoped)        |
| GET    | `/api/bookings/:id`            | Authenticated       | Get booking details                |
| PATCH  | `/api/bookings/:id/status`     | TECHNICIAN, ADMIN   | Update booking status (ACCEPTED/DECLINED/IN_PROGRESS/COMPLETED) |
| PATCH  | `/api/bookings/:id/cancel`     | CUSTOMER (owner)    | Cancel booking (only when REQUESTED or ACCEPTED) |
| POST   | `/api/payments/create`         | CUSTOMER (owner)    | Initiate SSLCommerz payment        |
| POST   | `/api/payments/confirm`        | Public (webhook)    | SSLCommerz payment callback        |
| GET    | `/api/payments`                | CUSTOMER            | List own payments (paginated)      |
| GET    | `/api/payments/:id`            | CUSTOMER (owner)    | Get payment details                |
| POST   | `/api/reviews`                 | CUSTOMER (owner)    | Create review for completed booking|
| GET    | `/api/reviews/technician/:id`  | Public              | Get reviews for a technician       |
| GET    | `/api/admin/users`             | ADMIN               | List all users (paginated)         |
| PATCH  | `/api/admin/users/:id`         | ADMIN               | Ban/activate user                  |
| GET    | `/api/admin/bookings`          | ADMIN               | List all bookings (paginated)      |
| GET    | `/api/admin/categories`        | ADMIN               | List all categories                |
| POST   | `/api/admin/categories`        | ADMIN               | Create category                    |
| GET    | `/api/technicians`             | Public              | List technician profiles           |
| GET    | `/api/technicians/:id`         | Public              | Get technician profile with reviews|
| PUT    | `/api/technician/profile`      | TECHNICIAN          | Upsert own profile                 |
| PUT    | `/api/technician/availability` | TECHNICIAN          | Set availability slots             |
| GET    | `/api/technician/bookings`     | TECHNICIAN          | Get assigned bookings (paginated)  |
| PATCH  | `/api/technician/bookings/:id` | TECHNICIAN          | Update assigned booking status     |

