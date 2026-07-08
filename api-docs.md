# FixItNow API Documentation

**Base URL:** `http://localhost:5000/api`

**Auth:** JWT Bearer tokens via `Authorization: Bearer <token>` header or `accessToken`/`refreshToken` cookies.

**All responses follow this envelope:**
```json
{
  "success": true|false,
  "statusCode": 200,
  "message": "Description",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 100 }
}
```

---

## Table of Contents

- [Auth](#1-auth)
- [Categories](#2-categories)
- [Services](#3-services)
- [Bookings](#4-bookings)
- [Payments](#5-payments)
- [Reviews](#6-reviews)
- [Admin](#7-admin)
- [Technicians (Public)](#8-technicians-public)
- [Technician Operations](#9-technician-operations)

---

## 1. Auth

### POST /api/auth/register

Register a new user.

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",            // optional
  "email": "john@example.com",   // required, valid email
  "password": "securepassword",  // required, min 6 chars
  "role": "CUSTOMER",            // optional, default: "CUSTOMER", enum: "CUSTOMER" | "TECHNICIAN"
  "phone": "01712345678",        // optional
  "address": "Dhaka"             // optional
}
```

**Response 201:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "image": null,
    "phone": "01712345678",
    "address": "Dhaka",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "isDeleted": false,
    "createdAt": "2026-07-08T00:00:00.000Z",
    "updatedAt": "2026-07-08T00:00:00.000Z"
  }
}
```

**Error 400:** Duplicate email, invalid email, short password, missing required fields.

---

### POST /api/auth/login

Authenticate and receive JWT tokens.

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",   // required
  "password": "securepassword"   // required
}
```

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      ...
    }
  }
}
```

Tokens are also set as HTTP-only cookies: `accessToken` (24h), `refreshToken` (7d).

**Error 401:** Wrong password.
**Error 403:** Banned user.
**Error 404:** Email not found.

---

### POST /api/auth/refresh-token

Get a new access token from the refresh token.

**Access:** Public (requires `refreshToken` cookie)

**Cookie required:** `refreshToken`

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Access token renewed successfully",
  "data": { "accessToken": "eyJhbGciOiJIUzI1NiIs..." }
}
```

**Error 401:** Missing or invalid refresh token.

---

### GET /api/auth/me

Get the currently authenticated user's profile.

**Access:** Authenticated (any role)

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile context retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "technicianProfile": null  // populated if role is TECHNICIAN
  }
}
```

**Error 401:** No token or invalid token.
**Error 403:** Banned user.

---

## 2. Categories

### GET /api/categories

List all categories.

**Access:** Public

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Electrical",
      "slug": "electrical",
      "createdAt": "2026-07-08T00:00:00.000Z",
      "updatedAt": "2026-07-08T00:00:00.000Z"
    }
  ]
}
```

---

## 3. Services

### GET /api/services

List all non-deleted services.

**Access:** Public

**Query Parameters (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name (case-insensitive) |
| `categoryId` | UUID | Filter by category |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Services Fetch Successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Fix Leaky Pipe",
      "price": 150,
      "categoryId": "uuid",
      "technicianId": "uuid",
      "isDeleted": false,
      "createdAt": "2026-07-08T00:00:00.000Z",
      "updatedAt": "2026-07-08T00:00:00.000Z",
      "category": { "id": "uuid", "name": "Plumbing", "slug": "plumbing" },
      "technician": {
        "id": "uuid",
        "user": { "id": "uuid", "email": "tech@example.com", "status": "ACTIVE" }
      }
    }
  ]
}
```

---

### POST /api/services

Create a new service offering.

**Access:** TECHNICIAN only

**Headers:** `Authorization: Bearer <technician_token>`

**Request Body:**
```json
{
  "name": "Fix Leaky Pipe",       // required, min 3 chars
  "price": 150,                    // required, positive number
  "categoryId": "uuid"             // required, valid UUID
}
```

**Response 201:** Returns the created service.

**Error 400:** Validation error.
**Error 403:** Not a technician.
**Error 404:** Category or technician profile not found.

---

### PATCH /api/services/:id

Update a service (owner only).

**Access:** TECHNICIAN (owner of the service)

**Headers:** `Authorization: Bearer <technician_token>`

**Request Body (all optional):**
```json
{
  "name": "Updated Name",   // min 3 chars
  "price": 200,              // positive number
  "categoryId": "uuid"       // valid UUID
}
```

**Response 200:** Returns updated service.

**Error 403:** Not the owner.
**Error 404:** Service not found.

---

### DELETE /api/services/:id

Soft-delete a service (owner only).

**Access:** TECHNICIAN (owner)

**Headers:** `Authorization: Bearer <technician_token>`

**Response 200:** Returns the deleted service (isDeleted: true).

**Error 403:** Not the owner.
**Error 404:** Service not found.

---

## 4. Bookings

### POST /api/bookings

Create a new booking.

**Access:** CUSTOMER only

**Headers:** `Authorization: Bearer <customer_token>`

**Request Body:**
```json
{
  "serviceId": "uuid",                        // required, valid UUID
  "scheduledTime": "2026-07-20T10:00:00Z",    // required, ISO 8601
  "address": "123 Main Street, Dhaka",        // required, min 5 chars
  "phone": "01712345678"                      // required, min 7 chars
}
```

**Response 201:** Returns the created booking with status `REQUESTED`.

**Error 400:** Validation error.
**Error 403:** Not a customer.
**Error 404:** Service not found.

---

### GET /api/bookings

Get bookings for the authenticated user.

**Access:** CUSTOMER, TECHNICIAN, ADMIN

**Headers:** `Authorization: Bearer <token>`

**Behavior by role:**
- **CUSTOMER:** Returns own bookings
- **TECHNICIAN:** Returns bookings assigned to their profile
- **ADMIN:** Returns all bookings

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bookings fetched successfully",
  "data": [
    {
      "id": "uuid",
      "customerId": "uuid",
      "technicianId": "uuid",
      "serviceId": "uuid",
      "status": "REQUESTED",
      "scheduledTime": "2026-07-20T10:00:00Z",
      "isDeleted": false,
      "createdAt": "2026-07-08T00:00:00.000Z",
      "updatedAt": "2026-07-08T00:00:00.000Z",
      "customer": { "id": "uuid", "email": "customer@test.com" },
      "service": { "id": "uuid", "name": "Fix Leaky Pipe", "price": 150 },
      "technician": { "id": "uuid", "user": { "email": "tech@test.com" } }
    }
  ]
}
```

---

### GET /api/bookings/:id

Get booking details.

**Access:** CUSTOMER (owner), TECHNICIAN (assigned), ADMIN

**Headers:** `Authorization: Bearer <token>`

**Response 200:** Full booking details with customer and service data.

**Error 403:** Not authorized to view this booking.
**Error 404:** Booking not found.

---

### PATCH /api/bookings/:id/status

Update booking status.

**Access:** TECHNICIAN (assigned), ADMIN

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "ACCEPTED"
}
```

**Valid status values:** `ACCEPTED`, `DECLINED`, `IN_PROGRESS`, `COMPLETED`

**State machine:**
```
REQUESTED → ACCEPTED
REQUESTED → DECLINED
PAID → IN_PROGRESS
IN_PROGRESS → COMPLETED
```

**Response 200:** Updated booking.

**Error 400:** Invalid state transition or status value.
**Error 403:** Not authorized.
**Error 404:** Booking not found.

---

### PATCH /api/bookings/:id/cancel

Cancel a booking.

**Access:** CUSTOMER (owner)

**Headers:** `Authorization: Bearer <customer_token>`

**Cancellable statuses:** `REQUESTED`, `ACCEPTED`

**Non-cancellable statuses:** `PAID`, `IN_PROGRESS`, `COMPLETED`, `DECLINED`, `CANCELLED`

**Response 200:** Booking with status `CANCELLED`.

**Error 400:** Booking in non-cancellable status.
**Error 403:** Not a customer.
**Error 404:** Booking not found.

---

## 5. Payments

### POST /api/payments/create

Initiate payment via SSLCommerz gateway.

**Access:** CUSTOMER (owner of booking)

**Headers:** `Authorization: Bearer <customer_token>`

**Request Body:**
```json
{
  "bookingId": "uuid"   // required, valid UUID
}
```

**Prerequisites:** Booking must be in `ACCEPTED` status.

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment gateway initiated successfully. Redirect user to the returned URL.",
  "data": {
    "gatewayUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/..."
  }
}
```

**Error 400:** Invalid booking status, payment already pending/completed.
**Error 404:** Booking not found.
**Error 502:** SSLCommerz gateway initialization failed.

---

### POST /api/payments/confirm

SSLCommerz redirect/webhook callback.

**Access:** Public

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `bookingId` | UUID | Booking ID |
| `tranId` | string | Transaction ID |
| `status` | string | `success`, `fail`, or `cancel` |

**Request Body (for success):**
```json
{
  "val_id": "<ssl_validation_id>"
}
```

**Flow:**
1. On `success`: Validates transaction with SSLCommerz validation API
2. On valid: Updates booking → `PAID`, payment → `COMPLETED`
3. On invalid/fail/cancel: Updates booking → `CANCELLED`, payment → `FAILED`

**Response 200/402:** Status-dependent.

---

### GET /api/payments

Get all payments for the authenticated customer.

**Access:** CUSTOMER

**Headers:** `Authorization: Bearer <customer_token>`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "uuid",
        "bookingId": "uuid",
        "transactionId": "TXN-1234567890-ABCDEF",
        "amount": 150,
        "provider": "SSLCOMMERZ",
        "status": "COMPLETED",
        "paidAt": "2026-07-08T00:00:00.000Z",
        "createdAt": "2026-07-08T00:00:00.000Z",
        "booking": {
          "id": "uuid",
          "status": "PAID",
          "scheduledTime": "2026-07-20T10:00:00Z",
          "service": { "name": "Fix Leaky Pipe" }
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### GET /api/payments/:id

Get payment details.

**Access:** CUSTOMER (owner)

**Headers:** `Authorization: Bearer <customer_token>`

**Response 200:** Payment details with booking and service info.

**Error 404:** Payment not found or not owned by user.

---

## 6. Reviews

### POST /api/reviews

Create a review for a completed booking.

**Access:** CUSTOMER (owner of booking)

**Headers:** `Authorization: Bearer <customer_token>`

**Request Body:**
```json
{
  "bookingId": "uuid",     // required, valid UUID
  "rating": 5,              // required, integer 1-5
  "comment": "Excellent service! Very professional and on time."  // required, min 5 chars
}
```

**Prerequisites:** Booking must be in `COMPLETED` status.

**Response 201:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Customer feedback submitted and profile matrix aggregated successfully",
  "data": {
    "id": "uuid",
    "bookingId": "uuid",
    "customerId": "uuid",
    "technicianId": "uuid",
    "rating": 5,
    "comment": "Excellent service! Very professional and on time.",
    "createdAt": "2026-07-08T00:00:00.000Z",
    "updatedAt": "2026-07-08T00:00:00.000Z"
  }
}
```

The technician's average rating is automatically recalculated.

**Error 400:** Booking not completed, duplicate review, invalid rating.
**Error 404:** Booking not found.
**Error 403:** Not a customer.

---

### GET /api/reviews/technician/:technicianId

Get all reviews for a technician profile.

**Access:** Public

**Path Parameters:** `technicianId` — UUID of the TechnicianProfile

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technician public feedback streams queried successfully",
  "data": [
    {
      "id": "uuid",
      "bookingId": "uuid",
      "customerId": "uuid",
      "technicianId": "uuid",
      "rating": 5,
      "comment": "Excellent service!",
      "createdAt": "2026-07-08T00:00:00.000Z",
      "customer": { "id": "uuid", "email": "customer@test.com", "name": "John" }
    }
  ]
}
```

Returns an empty array if no reviews or technician doesn't exist.

---

## 7. Admin

All admin endpoints require `Authorization: Bearer <admin_token>` and ADMIN role.

### GET /api/admin/users

List all users with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      { "id": "uuid", "name": null, "email": "user@test.com", "role": "CUSTOMER", "status": "ACTIVE", "createdAt": "..." }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

---

### PATCH /api/admin/users/:id

Update user status (ban/activate).

**Request Body:**
```json
{
  "status": "BANNED"   // enum: "ACTIVE" | "BANNED"
}
```

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User status updated to BANNED successfully",
  "data": { "id": "uuid", "name": null, "email": "user@test.com", "status": "BANNED" }
}
```

---

### GET /api/admin/bookings

List all bookings with pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response 200:** Bookings with customer, technician, and service data.

---

### GET /api/admin/categories

List all categories. Same data as public endpoint but requires admin auth.

**Response 200:** Array of categories.

---

### POST /api/admin/categories

Create a new category.

**Request Body:**
```json
{
  "name": "Plumbing",     // required, min 3 chars
  "slug": "plumbing"      // required, min 3 chars
}
```

**Response 201:** Created category.

**Error 400:** Validation error.
**Error 409:** Duplicate name/slug.

---

## 8. Technicians (Public)

### GET /api/technicians

List all technician profiles.

**Access:** Public

**Query Parameters (all optional):**

| Param | Type | Description |
|-------|------|-------------|
| `location` | string | Filter by location (case-insensitive) |
| `minRating` | number | Minimum average rating |

**Response 200:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Technicians retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "bio": "Expert plumber",
      "location": "Dhaka",
      "experience": 5,
      "rating": 4.5,
      "availability": ["2026-07-20T09:00:00Z"],
      "user": { "id": "uuid", "name": "Mike", "email": "mike@test.com", "image": null },
      "services": [
        {
          "id": "uuid",
          "name": "Fix Leaky Pipe",
          "price": 150,
          "category": { "id": "uuid", "name": "Plumbing", "slug": "plumbing" }
        }
      ]
    }
  ]
}
```

---

### GET /api/technicians/:id

Get a single technician profile by profile ID.

**Access:** Public

**Response 200:** Technician profile with user, services, and reviews.

**Error 404:** Technician not found.

---

## 9. Technician Operations

All endpoints in this section require `Authorization: Bearer <technician_token>` and TECHNICIAN role.

### PUT /api/technician/profile

Update technician profile (upserts if not exists).

**Headers:** `Authorization: Bearer <technician_token>`

**Request Body (all optional):**
```json
{
  "bio": "Expert plumber with 5 years of experience.",
  "location": "Dhaka",
  "experience": 5
}
```

**Response 200:** Updated TechnicianProfile.

---

### PUT /api/technician/availability

Update available time slots.

**Headers:** `Authorization: Bearer <technician_token>`

**Request Body:**
```json
{
  "slots": [
    "2026-07-20T09:00:00Z",
    "2026-07-20T10:00:00Z",
    "2026-07-20T14:00:00Z"
  ]
}
```

Each slot must be a valid ISO 8601 datetime string.

**Response 200:** Updated TechnicianProfile.

---

### GET /api/technician/bookings

Get bookings assigned to the authenticated technician.

**Headers:** `Authorization: Bearer <technician_token>`

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Response 200:** Paginated bookings with customer and service data.

---

### PATCH /api/technician/bookings/:id

Advance booking state (same as PATCH /api/bookings/:id/status but scoped to technician).

**Headers:** `Authorization: Bearer <technician_token>`

**Request Body:**
```json
{
  "status": "ACCEPTED"
}
```

**Valid values:** `ACCEPTED`, `DECLINED`, `IN_PROGRESS`, `COMPLETED`

---

## Error Reference

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation Error — malformed input, missing fields, invalid state |
| 401 | Unauthorized — missing, expired, or invalid token |
| 403 | Forbidden — wrong role for the endpoint |
| 404 | Resource Not Found |
| 409 | Duplicate Resource Conflict |
| 402 | Payment Required — payment failed |
| 500 | Internal Server Error |
| 502 | Bad Gateway — external service failure (SSLCommerz) |

**Error Response Format:**
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errorDetails": {
    "issues": [
      { "field": "email", "message": "Please provide a valid email address" }
    ],
    "name": "ZodError"
  }
}
```

## Enums Reference

```typescript
enum UserRole { CUSTOMER, TECHNICIAN, ADMIN }
enum UserStatus { ACTIVE, BANNED }

enum BookingStatus {
  REQUESTED,     // Initial state after customer books
  ACCEPTED,      // Technician accepted
  DECLINED,      // Technician declined
  PAID,          // Payment completed
  IN_PROGRESS,   // Technician started work
  COMPLETED,     // Job finished
  CANCELLED      // Cancelled by customer or on payment failure
}

enum PaymentStatus { PENDING, COMPLETED, FAILED }
```

## Postman Collection

Import `postman_collection.json` into Postman. It includes:

- All 28 endpoints with pre-filled bodies
- Collection variables for `baseUrl`, `customerToken`, `technicianToken`, `adminToken`, IDs
- Test scripts that auto-capture tokens and IDs from responses
- Ready-to-use environment variables
