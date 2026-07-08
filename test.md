# FixItNow API — Comprehensive Test Guide

Base URL: `http://localhost:5000/api`

---

## Table of Contents

1. [Auth Endpoints](#1-auth-endpoints)
2. [Category Endpoints](#2-category-endpoints)
3. [Service Endpoints](#3-service-endpoints)
4. [Booking Endpoints](#4-booking-endpoints)
5. [Payment Endpoints](#5-payment-endpoints)
6. [Review Endpoints](#6-review-endpoints)
7. [Admin Endpoints](#7-admin-endpoints)
8. [Technician Endpoints](#8-technician-endpoints)
9. [Error Handling Tests](#9-error-handling-tests)
10. [Edge Cases & Security](#10-edge-cases--security)
11. [Full Lifecycle Flow](#11-full-lifecycle-flow)

---

## 1. Auth Endpoints

### POST /api/auth/register

Register a new user.

**Test Cases:**

| # | Scenario | Body | Expected Status |
|---|----------|------|-----------------|
| 1.1 | Register CUSTOMER | `{ "email": "customer1@test.com", "password": "password123", "role": "CUSTOMER" }` | 201 |
| 1.2 | Register TECHNICIAN | `{ "email": "tech1@test.com", "password": "password123", "role": "TECHNICIAN" }` | 201 |
| 1.3 | Register with name | `{ "email": "john@test.com", "password": "password123", "name": "John Doe", "role": "CUSTOMER" }` | 201 |
| 1.4 | Register with address/phone | `{ "email": "jane@test.com", "password": "password123", "role": "CUSTOMER", "phone": "01712345678", "address": "Dhaka" }` | 201 |
| 1.5 | Duplicate email | Same email as 1.1 | 400 |
| 1.6 | Invalid email format | `{ "email": "notanemail", "password": "password123" }` | 400 |
| 1.7 | Password too short | `{ "email": "short@test.com", "password": "123" }` | 400 |
| 1.8 | Empty body | `{}` | 400 |
| 1.9 | Missing email | `{ "password": "password123" }` | 400 |
| 1.10 | Missing password | `{ "email": "test@test.com" }` | 400 |
| 1.11 | Invalid role | `{ "email": "badrole@test.com", "password": "password123", "role": "INVALID" }` | 400 |
| 1.12 | Extra fields (should ignore) | `{ "email": "extra@test.com", "password": "password123", "role": "CUSTOMER", "malicious": "hack" }` | 201 |

### POST /api/auth/login

Authenticate and receive JWT tokens.

**Test Cases:**

| # | Scenario | Body | Expected Status |
|---|----------|------|-----------------|
| 1.13 | Login CUSTOMER | `{ "email": "customer1@test.com", "password": "password123" }` | 200 |
| 1.14 | Login TECHNICIAN | `{ "email": "tech1@test.com", "password": "password123" }` | 200 |
| 1.15 | Wrong password | `{ "email": "customer1@test.com", "password": "wrongpass" }` | 401 |
| 1.16 | Non-existent email | `{ "email": "nobody@test.com", "password": "password123" }` | 404 |
| 1.17 | Empty body | `{}` | 400 |
| 1.18 | Missing password | `{ "email": "customer1@test.com" }` | 400 |
| 1.19 | SQL injection in email | `{ "email": "' OR 1=1 --", "password": "test" }` | 400/401 |

**Success Response (200):**
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
      "name": null,
      "email": "customer1@test.com",
      "image": null,
      "phone": null,
      "address": null,
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "isDeleted": false,
      "createdAt": "2026-07-08T00:00:00.000Z",
      "updatedAt": "2026-07-08T00:00:00.000Z"
    }
  }
}
```

### POST /api/auth/refresh-token

Obtain a new access token using the refresh token.

**Test Cases:**

| # | Scenario | Cookie/Send | Expected Status |
|---|----------|-------------|-----------------|
| 1.20 | Valid refresh cookie | Send `refreshToken` cookie from login | 200 |
| 1.21 | No cookie | No cookie sent | 401 |
| 1.22 | Expired/invalid cookie | Send `refreshToken=invalidtoken` | 401 |

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Access token renewed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### GET /api/auth/me

Get current authenticated user profile.

**Test Cases:**

| # | Scenario | Auth Header | Expected Status |
|---|----------|-------------|-----------------|
| 1.23 | Customer authenticated | `Bearer <customer_token>` | 200 |
| 1.24 | Technician authenticated | `Bearer <technician_token>` | 200 |
| 1.25 | No token | (none) | 401 |
| 1.26 | Malformed token | `Bearer invalidtoken123` | 401 |
| 1.27 | Empty token | `Bearer ` | 401 |
| 1.28 | No Bearer prefix | `somerandomtoken` | 401 |
| 1.29 | Expired token | `Bearer <expired_token>` | 401 |

---

## 2. Category Endpoints

### GET /api/categories

List all categories (public).

**Test Cases:**

| # | Scenario | Expected Status |
|---|----------|-----------------|
| 2.1 | No auth required | 200 |
| 2.2 | Returns ordered by name ascending | 200 |

**Success Response (200):**
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
    },
    {
      "id": "uuid",
      "name": "Plumbing",
      "slug": "plumbing",
      "createdAt": "2026-07-08T00:00:00.000Z",
      "updatedAt": "2026-07-08T00:00:00.000Z"
    }
  ]
}
```

---

## 3. Service Endpoints

### GET /api/services

List all services (public) with optional filters.

**Test Cases:**

| # | Scenario | Query Params | Expected Status |
|---|----------|--------------|-----------------|
| 3.1 | No filters | (none) | 200 |
| 3.2 | Search by name | `?search=fix` | 200 |
| 3.3 | Filter by category | `?categoryId=<uuid>` | 200 |
| 3.4 | Filter by price range | `?minPrice=50&maxPrice=500` | 200 |
| 3.5 | Min price only | `?minPrice=100` | 200 |
| 3.6 | Max price only | `?maxPrice=200` | 200 |
| 3.7 | Combined filters | `?search=fix&minPrice=50&maxPrice=500` | 200 |
| 3.8 | Negative price | `?minPrice=-100` | 200 |
| 3.9 | Invalid UUID category | `?categoryId=abc` | 200 |

### POST /api/services

Create a service (TECHNICIAN only).

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 3.10 | Valid creation | TECHNICIAN | `{ "name": "Fix Leaky Pipe", "price": 150, "categoryId": "<uuid>" }` | 201 |
| 3.11 | Customer forbidden | CUSTOMER | Same as above | 403 |
| 3.12 | No auth | (none) | Same as above | 401 |
| 3.13 | Empty body | TECHNICIAN | `{}` | 400 |
| 3.14 | Missing name | TECHNICIAN | `{ "price": 100, "categoryId": "<uuid>" }` | 400 |
| 3.15 | Missing price | TECHNICIAN | `{ "name": "Test", "categoryId": "<uuid>" }` | 400 |
| 3.16 | Missing categoryId | TECHNICIAN | `{ "name": "Test", "price": 100 }` | 400 |
| 3.17 | Name too short | TECHNICIAN | `{ "name": "AB", "price": 100, "categoryId": "<uuid>" }` | 400 |
| 3.18 | Negative price | TECHNICIAN | `{ "name": "Test", "price": -10, "categoryId": "<uuid>" }` | 400 |
| 3.19 | Invalid categoryId UUID | TECHNICIAN | `{ "name": "Test", "price": 100, "categoryId": "not-a-uuid" }` | 400 |
| 3.20 | Nonexistent category | TECHNICIAN | `{ "name": "Test", "price": 100, "categoryId": "00000000-0000-0000-0000-000000000000" }` | 404 |

### PATCH /api/services/:id

Update a service (TECHNICIAN only, owner only).

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 3.21 | Update own service | TECHNICIAN (owner) | `{ "name": "Updated Name", "price": 200 }` | 200 |
| 3.22 | Update name only | TECHNICIAN (owner) | `{ "name": "New Name" }` | 200 |
| 3.23 | Update price only | TECHNICIAN (owner) | `{ "price": 250 }` | 200 |
| 3.24 | No auth | (none) | `{ "name": "Hack" }` | 401 |
| 3.25 | Customer forbidden | CUSTOMER | `{ "name": "Hack" }` | 403 |
| 3.26 | Different technician | TECHNICIAN (non-owner) | `{ "name": "Hack" }` | 403 |
| 3.27 | Nonexistent service | TECHNICIAN | `{ "name": "Test" }` | 404 |
| 3.28 | Empty body (no fields to update) | TECHNICIAN | `{}` | 200 |
| 3.29 | Invalid price | TECHNICIAN | `{ "price": -50 }` | 400 |

### DELETE /api/services/:id

Soft-delete a service (TECHNICIAN only, owner only).

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 3.30 | Delete own service | TECHNICIAN (owner) | 200 |
| 3.31 | No auth | (none) | 401 |
| 3.32 | Customer forbidden | CUSTOMER | 403 |
| 3.33 | Different technician | TECHNICIAN (non-owner) | 403 |
| 3.34 | Nonexistent service | TECHNICIAN | 404 |
| 3.35 | Delete already deleted service | TECHNICIAN (owner) | 404 |

---

## 4. Booking Endpoints

### POST /api/bookings

Create a booking (CUSTOMER only).

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 4.1 | Valid booking | CUSTOMER | `{ "serviceId": "<uuid>", "scheduledTime": "2026-07-15T10:00:00.000Z", "address": "123 Main St, Dhaka", "phone": "01712345678" }` | 201 |
| 4.2 | No auth | (none) | Same as above | 401 |
| 4.3 | Technician forbidden | TECHNICIAN | Same as above | 403 |
| 4.4 | Empty body | CUSTOMER | `{}` | 400 |
| 4.5 | Missing serviceId | CUSTOMER | `{ "scheduledTime": "2026-07-15T10:00:00Z", "address": "addr", "phone": "01700000000" }` | 400 |
| 4.6 | Invalid serviceId UUID | CUSTOMER | `{ "serviceId": "bad-uuid", "scheduledTime": "2026-07-15T10:00:00Z", "address": "addr", "phone": "01700000000" }` | 400 |
| 4.7 | Nonexistent service | CUSTOMER | `{ "serviceId": "00000000-0000-0000-0000-000000000000", "scheduledTime": "2026-07-15T10:00:00Z", "address": "addr", "phone": "01700000000" }` | 404 |
| 4.8 | Invalid datetime | CUSTOMER | `{ "serviceId": "<uuid>", "scheduledTime": "not-a-date", "address": "addr", "phone": "01700000000" }` | 400 |
| 4.9 | Address too short | CUSTOMER | `{ "serviceId": "<uuid>", "scheduledTime": "2026-07-15T10:00:00Z", "address": "ab", "phone": "01700000000" }` | 400 |
| 4.10 | Phone too short | CUSTOMER | `{ "serviceId": "<uuid>", "scheduledTime": "2026-07-15T10:00:00Z", "address": "123 Main St", "phone": "017" }` | 400 |

### GET /api/bookings

List user bookings (role-based filtering).

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 4.11 | Customer sees own bookings | CUSTOMER | 200 |
| 4.12 | Technician sees assigned bookings | TECHNICIAN | 200 |
| 4.13 | Admin sees all bookings | ADMIN | 200 |
| 4.14 | No auth | (none) | 401 |

### GET /api/bookings/:id

Get booking details.

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 4.15 | Customer views own booking | CUSTOMER (owner) | 200 |
| 4.16 | Technician views assigned booking | TECHNICIAN (assigned) | 200 |
| 4.17 | Admin views any booking | ADMIN | 200 |
| 4.18 | Customer views other's booking | CUSTOMER (not owner) | 403 |
| 4.19 | Different technician | TECHNICIAN (not assigned) | 403 |
| 4.20 | Nonexistent booking | CUSTOMER | 404 |
| 4.21 | No auth | (none) | 401 |

### PATCH /api/bookings/:id/status

Update booking status (TECHNICIAN or ADMIN).

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 4.22 | Accept booking (REQUESTED → ACCEPTED) | TECHNICIAN | `{ "status": "ACCEPTED" }` | 200 |
| 4.23 | Decline booking (REQUESTED → DECLINED) | TECHNICIAN | `{ "status": "DECLINED" }` | 200 |
| 4.24 | Start work (PAID → IN_PROGRESS) | TECHNICIAN | `{ "status": "IN_PROGRESS" }` | 200 |
| 4.25 | Complete work (IN_PROGRESS → COMPLETED) | TECHNICIAN | `{ "status": "COMPLETED" }` | 200 |
| 4.26 | Skip state (REQUESTED → COMPLETED) | TECHNICIAN | `{ "status": "COMPLETED" }` | 400 |
| 4.27 | Invalid status value | TECHNICIAN | `{ "status": "INVALID" }` | 400 |
| 4.28 | No auth | (none) | `{ "status": "ACCEPTED" }` | 401 |
| 4.29 | Customer forbidden | CUSTOMER | `{ "status": "ACCEPTED" }` | 403 |
| 4.30 | Non-assigned technician | TECHNICIAN (not assigned) | `{ "status": "ACCEPTED" }` | 404 |

### PATCH /api/bookings/:id/cancel

Cancel booking (CUSTOMER only).

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 4.31 | Cancel REQUESTED booking | CUSTOMER (owner) | 200 |
| 4.32 | Cancel ACCEPTED booking | CUSTOMER (owner) | 200 |
| 4.33 | Cancel PAID booking (should fail) | CUSTOMER (owner) | 400 |
| 4.34 | Cancel COMPLETED booking (should fail) | CUSTOMER (owner) | 400 |
| 4.35 | Cancel already CANCELLED booking | CUSTOMER (owner) | 400 |
| 4.36 | No auth | (none) | 401 |
| 4.37 | Technician forbidden | TECHNICIAN | 403 |
| 4.38 | Cancel other's booking | CUSTOMER (not owner) | 404 |

---

## 5. Payment Endpoints

### POST /api/payments/create

Initiate payment for a booking (CUSTOMER only).

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 5.1 | Valid payment initiation | CUSTOMER (owner) | `{ "bookingId": "<uuid>" }` | 200 |
| 5.2 | No auth | (none) | `{ "bookingId": "<uuid>" }` | 401 |
| 5.3 | Technician forbidden | TECHNICIAN | `{ "bookingId": "<uuid>" }` | 403 |
| 5.4 | Empty body | CUSTOMER | `{}` | 400 |
| 5.5 | Invalid bookingId UUID | CUSTOMER | `{ "bookingId": "bad-uuid" }` | 400 |
| 5.6 | Nonexistent booking | CUSTOMER | `{ "bookingId": "00000000-0000-0000-0000-000000000000" }` | 404 |
| 5.7 | Booking not in ACCEPTED status | CUSTOMER | `{ "bookingId": "<REQUESTED_booking>" }` | 400 |
| 5.8 | Duplicate payment (PENDING) | CUSTOMER | `{ "bookingId": "<same_as_5.1>" }` | 400 |
| 5.9 | Already paid booking | CUSTOMER | `{ "bookingId": "<PAID_booking>" }` | 400 |

**Success Response (200):**
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

### POST /api/payments/confirm

SSLCommerz webhook callback (public).

**Test Cases:**

| # | Scenario | Query Params | Body | Expected Status |
|---|----------|--------------|------|-----------------|
| 5.10 | Success callback | `?bookingId=<uuid>&tranId=<id>&status=success` | `{ "val_id": "..." }` | 200 |
| 5.11 | Fail callback | `?bookingId=<uuid>&tranId=<id>&status=fail` | (none) | 402 |
| 5.12 | Cancel callback | `?bookingId=<uuid>&tranId=<id>&status=cancel` | (none) | 402 |
| 5.13 | Missing params | (none) | (none) | 400/500 |
| 5.14 | Success without val_id | `?bookingId=<uuid>&tranId=<id>&status=success` | (none) | 400 |

### GET /api/payments

List user payments (CUSTOMER only).

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 5.15 | Customer sees own payments | CUSTOMER | 200 |
| 5.16 | No auth | (none) | 401 |
| 5.17 | Pagination | CUSTOMER `?page=1&limit=5` | 200 |

### GET /api/payments/:id

Get payment details (CUSTOMER only, owner only).

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 5.18 | View own payment | CUSTOMER (owner) | 200 |
| 5.19 | No auth | (none) | 401 |
| 5.20 | Nonexistent payment | CUSTOMER | 404 |
| 5.21 | Other's payment | CUSTOMER (not owner) | 404 |

---

## 6. Review Endpoints

### POST /api/reviews

Create a review (CUSTOMER only, for COMPLETED bookings).

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 6.1 | Valid review | CUSTOMER (owner) | `{ "bookingId": "<uuid>", "rating": 5, "comment": "Excellent service!" }` | 201 |
| 6.2 | Rating 1 (minimum) | CUSTOMER | `{ "bookingId": "<uuid>", "rating": 1, "comment": "Poor" }` | 201 |
| 6.3 | No auth | (none) | `{ "bookingId": "<uuid>", "rating": 5, "comment": "Great" }` | 401 |
| 6.4 | Technician forbidden | TECHNICIAN | Same | 403 |
| 6.5 | Empty body | CUSTOMER | `{}` | 400 |
| 6.6 | Rating > 5 | CUSTOMER | `{ "bookingId": "<uuid>", "rating": 6, "comment": "test" }` | 400 |
| 6.7 | Rating < 1 | CUSTOMER | `{ "bookingId": "<uuid>", "rating": 0, "comment": "test" }` | 400 |
| 6.8 | Missing bookingId | CUSTOMER | `{ "rating": 5, "comment": "test" }` | 400 |
| 6.9 | Nonexistent booking | CUSTOMER | `{ "bookingId": "00000000-0000-0000-0000-000000000000", "rating": 5, "comment": "test" }` | 404 |
| 6.10 | Booking not COMPLETED | CUSTOMER | `{ "bookingId": "<REQUESTED_booking>", "rating": 5, "comment": "test" }` | 400 |
| 6.11 | Not customer's booking | CUSTOMER | `{ "bookingId": "<other_booking>", "rating": 5, "comment": "test" }` | 404 |
| 6.12 | Comment too short | CUSTOMER | `{ "bookingId": "<uuid>", "rating": 5, "comment": "abc" }` | 400 |
| 6.13 | Duplicate review for same booking | CUSTOMER | Same as 6.1 | 400 |

### GET /api/reviews/technician/:technicianId

Get reviews for a technician (public).

**Test Cases:**

| # | Scenario | Expected Status |
|---|----------|-----------------|
| 6.14 | Valid technician ID | 200 |
| 6.15 | Nonexistent technician ID | 200 (empty array) |
| 6.16 | No auth required | 200 |
| 6.17 | Invalid ID format | 500 |

---

## 7. Admin Endpoints

### GET /api/admin/users

List all users (ADMIN only).

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 7.1 | List users | ADMIN | 200 |
| 7.2 | No auth | (none) | 401 |
| 7.3 | Customer forbidden | CUSTOMER | 403 |
| 7.4 | Technician forbidden | TECHNICIAN | 403 |
| 7.5 | Pagination | ADMIN `?page=1&limit=5` | 200 |

### PATCH /api/admin/users/:id

Update user status (ADMIN only).

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 7.6 | Ban user | ADMIN | `{ "status": "BANNED" }` | 200 |
| 7.7 | Activate user | ADMIN | `{ "status": "ACTIVE" }` | 200 |
| 7.8 | No auth | (none) | `{ "status": "BANNED" }` | 401 |
| 7.9 | Customer forbidden | CUSTOMER | `{ "status": "BANNED" }` | 403 |
| 7.10 | Nonexistent user | ADMIN | `{ "status": "BANNED" }` | 500 |
| 7.11 | Empty body | ADMIN | `{}` | 400 |
| 7.12 | Invalid status | ADMIN | `{ "status": "INVALID" }` | 400 |

### GET /api/admin/bookings

List all bookings (ADMIN only).

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 7.13 | List all bookings | ADMIN | 200 |
| 7.14 | No auth | (none) | 401 |
| 7.15 | Customer forbidden | CUSTOMER | 403 |
| 7.16 | Pagination | ADMIN `?page=1&limit=5` | 200 |

### GET /api/admin/categories

List all categories (ADMIN only — duplicate of public endpoint but gated).

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 7.17 | List categories | ADMIN | 200 |
| 7.18 | No auth | (none) | 401 |

### POST /api/admin/categories

Create a category (ADMIN only).

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 7.19 | Create category | ADMIN | `{ "name": "New Category", "slug": "new-category" }` | 201 |
| 7.20 | Duplicate name | ADMIN | `{ "name": "New Category", "slug": "another-slug" }` | 500 |
| 7.21 | No auth | (none) | `{ "name": "Test", "slug": "test" }` | 401 |
| 7.22 | Invalid body | ADMIN | `{}` | 400 |
| 7.23 | Name too short | ADMIN | `{ "name": "AB", "slug": "ab" }` | 400 |
| 7.24 | Slug too short | ADMIN | `{ "name": "Long Name", "slug": "ab" }` | 400 |

---

## 8. Technician Endpoints

### Public Endpoints

#### GET /api/technicians

List all technicians (public).

**Test Cases:**

| # | Scenario | Query Params | Expected Status |
|---|----------|--------------|-----------------|
| 8.1 | List all | (none) | 200 |
| 8.2 | Filter by location | `?location=Dhaka` | 200 |
| 8.3 | Filter by min rating | `?minRating=4` | 200 |
| 8.4 | Combined filters | `?location=Dhaka&minRating=4` | 200 |
| 8.5 | Invalid minRating | `?minRating=abc` | 200 (ignores filter) |
| 8.6 | No auth required | (none) | 200 |

#### GET /api/technicians/:id

Get technician by ID (public).

**Test Cases:**

| # | Scenario | Expected Status |
|---|----------|-----------------|
| 8.7 | Existing technician ID | 200 |
| 8.8 | Nonexistent ID | 404 |
| 8.9 | Invalid UUID | 500 |

### Operations Endpoints (TECHNICIAN only)

#### PUT /api/technician/profile

Update technician profile.

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 8.10 | Update bio | TECHNICIAN | `{ "bio": "Experienced plumber with 5 years of experience" }` | 200 |
| 8.11 | Update location | TECHNICIAN | `{ "location": "Dhaka" }` | 200 |
| 8.12 | Update experience | TECHNICIAN | `{ "experience": 5 }` | 200 |
| 8.13 | Update all fields | TECHNICIAN | `{ "bio": "Pro", "location": "Dhaka", "experience": 3 }` | 200 |
| 8.14 | No auth | (none) | `{ "bio": "test" }` | 401 |
| 8.15 | Customer forbidden | CUSTOMER | `{ "bio": "test" }` | 403 |
| 8.16 | Negative experience | TECHNICIAN | `{ "experience": -5 }` | 400 |
| 8.17 | Empty body | TECHNICIAN | `{}` | 200 |

#### PUT /api/technician/availability

Update availability slots.

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 8.18 | Add slots | TECHNICIAN | `{ "slots": ["2026-07-15T09:00:00Z", "2026-07-15T10:00:00Z"] }` | 200 |
| 8.19 | Empty slots | TECHNICIAN | `{ "slots": [] }` | 200 |
| 8.20 | No auth | (none) | `{ "slots": [] }` | 401 |
| 8.21 | Invalid datetime | TECHNICIAN | `{ "slots": ["not-a-date"] }` | 400 |
| 8.22 | Missing slots field | TECHNICIAN | `{}` | 400 |

#### GET /api/technician/bookings

Get assigned bookings (TECHNICIAN only).

**Test Cases:**

| # | Scenario | Auth | Expected Status |
|---|----------|------|-----------------|
| 8.23 | View assigned bookings | TECHNICIAN | 200 |
| 8.24 | No auth | (none) | 401 |
| 8.25 | Pagination | TECHNICIAN `?page=1&limit=5` | 200 |

#### PATCH /api/technician/bookings/:id

Advance booking state (TECHNICIAN only).

**Test Cases:**

| # | Scenario | Auth | Body | Expected Status |
|---|----------|------|------|-----------------|
| 8.26 | Accept | TECHNICIAN (assigned) | `{ "status": "ACCEPTED" }` | 200 |
| 8.27 | Decline | TECHNICIAN (assigned) | `{ "status": "DECLINED" }` | 200 |
| 8.28 | No auth | (none) | `{ "status": "ACCEPTED" }` | 401 |
| 8.29 | Customer forbidden | CUSTOMER | `{ "status": "ACCEPTED" }` | 403 |
| 8.30 | Invalid status | TECHNICIAN | `{ "status": "INVALID" }` | 400 |

---

## 9. Error Handling Tests

### 404 Handler

| # | Scenario | Method | URL | Expected Status |
|---|----------|--------|-----|-----------------|
| 9.1 | Unknown GET route | GET | `/api/nonexistent` | 404 |
| 9.2 | Unknown POST route | POST | `/api/nonexistent` | 404 |
| 9.3 | Unknown PATCH route | PATCH | `/api/nonexistent` | 404 |
| 9.4 | Unknown DELETE route | DELETE | `/api/nonexistent` | 404 |

### Validation Errors (400)

| # | Scenario | Endpoint | Issue |
|---|----------|----------|-------|
| 9.5 | JSON parse error | Any | Send malformed JSON `{bad json` |
| 9.6 | Wrong Content-Type | POST | Send `text/plain` instead of `application/json` |
| 9.7 | Empty JSON array | POST | Send `[]` instead of object |
| 9.8 | null body | POST | Send `null` |

### Auth Errors

| # | Scenario | Expected Status |
|---|----------|-----------------|
| 9.9 | No Authorization header | 401 |
| 9.10 | Empty Bearer token | 401 |
| 9.11 | Malformed JWT | 401 |
| 9.12 | Expired JWT | 401 |
| 9.13 | Wrong role for endpoint | 403 |

---

## 10. Edge Cases & Security

### Input Validation

| # | Test | Expected Behavior |
|---|------|-------------------|
| 10.1 | SQL injection in string fields: `' OR 1=1 --` | Rejected or safely handled |
| 10.2 | XSS in name/comment: `<script>alert('xss')</script>` | Stored safely, returned as plain text |
| 10.3 | Extremely long strings (5000+ chars) | Truncated or rejected at DB level (VarChar(255)) |
| 10.4 | Unicode/emoji in fields: `Hello 😊 你好` | Accepted and stored correctly |
| 10.5 | Whitespace-only strings: `"   "` | Should fail min-length validation |
| 10.6 | Special characters: `!@#$%^&*()` | Accepted in comment/address fields |
| 10.7 | Integer overflow for price (very large number) | Handled by Prisma/PostgreSQL |
| 10.8 | Zero for price | `z.number().positive()` rejects 0 |
| 10.9 | Negative numbers for price/experience | Rejected by Zod |

### Authorization

| # | Test | Expected Behavior |
|---|------|-------------------|
| 10.10 | Access another user's bookings | 403 Forbidden |
| 10.11 | Access another user's payments | 404 Not Found |
| 10.12 | Modify another technician's service | 403 Forbidden |
| 10.13 | Customer tries technician operations | 403 Forbidden |
| 10.14 | Banned user tries to login | 403 Forbidden |
| 10.15 | Banned user tries to use old token | 401 (authGuard checks DB) |

### Rate & Load

| # | Test | Expected Behavior |
|---|------|-------------------|
| 10.16 | Rapid sequential requests (burst) | Server handles without crash |
| 10.17 | Concurrent duplicate registrations | Unique constraint prevents duplicates |
| 10.18 | Large page size: `?limit=10000` | Returns data (may be slow) |

---

## 11. Full Lifecycle Flow

Complete end-to-end scenario:

```
1. Admin creates a category
   POST /api/admin/categories
   Headers: Authorization: Bearer <admin_token>
   Body: { "name": "Plumbing", "slug": "plumbing" }

2. Technician registers
   POST /api/auth/register
   Body: { "email": "plumber@test.com", "password": "password123", "role": "TECHNICIAN" }

3. Technician logs in
   POST /api/auth/login
   Body: { "email": "plumber@test.com", "password": "password123" }

4. Technician updates profile
   PUT /api/technician/profile
   Headers: Authorization: Bearer <tech_token>
   Body: { "bio": "Expert plumber", "location": "Dhaka", "experience": 5 }

5. Technician sets availability
   PUT /api/technician/availability
   Headers: Authorization: Bearer <tech_token>
   Body: { "slots": ["2026-07-15T09:00:00Z", "2026-07-15T14:00:00Z"] }

6. Technician creates a service
   POST /api/services
   Headers: Authorization: Bearer <tech_token>
   Body: { "name": "Fix Leaky Pipe", "price": 150, "categoryId": "<category_uuid>" }

7. Customer registers
   POST /api/auth/register
   Body: { "email": "customer@test.com", "password": "password123", "role": "CUSTOMER" }

8. Customer logs in
   POST /api/auth/login
   Body: { "email": "customer@test.com", "password": "password123" }

9. Customer views available services
   GET /api/services?categoryId=<category_uuid>

10. Customer books a service
    POST /api/bookings
    Headers: Authorization: Bearer <customer_token>
    Body: { "serviceId": "<service_uuid>", "scheduledTime": "2026-07-15T10:00:00.000Z", "address": "123 Main St", "phone": "01712345678" }

11. Customer views their booking
    GET /api/bookings

12. Technician accepts the booking
    PATCH /api/technician/bookings/<booking_uuid>
    Headers: Authorization: Bearer <tech_token>
    Body: { "status": "ACCEPTED" }

13. Customer initiates payment
    POST /api/payments/create
    Headers: Authorization: Bearer <customer_token>
    Body: { "bookingId": "<booking_uuid>" }
    → Receives SSLCommerz gateway URL

14. Payment webhook (success)
    POST /api/payments/confirm?bookingId=<booking_uuid>&tranId=<txn>&status=success
    Body: { "val_id": "<ssl_validation_id>" }

15. Technician starts the job
    PATCH /api/technician/bookings/<booking_uuid>
    Headers: Authorization: Bearer <tech_token>
    Body: { "status": "IN_PROGRESS" }

16. Technician completes the job
    PATCH /api/technician/bookings/<booking_uuid>
    Headers: Authorization: Bearer <tech_token>
    Body: { "status": "COMPLETED" }

17. Customer reviews the service
    POST /api/reviews
    Headers: Authorization: Bearer <customer_token>
    Body: { "bookingId": "<booking_uuid>", "rating": 5, "comment": "Excellent work!" }

18. Everyone can see the technician's reviews
    GET /api/reviews/technician/<technician_profile_uuid>
```

---

## Demo Data

### Pre-seeded Database Records

```json
// Categories
[
  { "name": "Electrical", "slug": "electrical" },
  { "name": "Plumbing", "slug": "plumbing" },
  { "name": "Cleaning", "slug": "cleaning" },
  { "name": "Carpentry", "slug": "carpentry" },
  { "name": "Painting", "slug": "painting" }
]

// Services
[
  { "name": "Fix Leaky Pipe", "price": 150 },
  { "name": "Install Ceiling Fan", "price": 200 },
  { "name": "Deep Clean Apartment", "price": 300 },
  { "name": "Repair Wooden Cabinet", "price": 250 },
  { "name": "Paint Room (Single Coat)", "price": 180 }
]

// Test Users
[
  { "email": "admin@fixitnow.com", "password": "Admin@123", "role": "ADMIN" },
  { "email": "customer@test.com", "password": "Customer@123", "role": "CUSTOMER" },
  { "email": "tech@test.com", "password": "Tech@123", "role": "TECHNICIAN" }
]
```

### Curl Commands for Quick Testing

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","role":"CUSTOMER"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get Me (replace TOKEN)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Get Categories (public)
curl http://localhost:5000/api/categories

# Get Services with filter
curl "http://localhost:5000/api/services?search=fix&minPrice=50&maxPrice=500"

# Get Technicians
curl http://localhost:5000/api/technicians?location=Dhaka

# Get Technician Reviews
curl http://localhost:5000/api/reviews/technician/TECHNICIAN_PROFILE_ID
```

---

## Quick Reference

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation Error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Duplicate Resource |
| 500 | Internal Server Error |

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errorDetails": { ... }
}
```

All success responses follow this format:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```
