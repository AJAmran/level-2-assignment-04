# 📋 Assignment 4: Backend Project Specification

## Project Name: **FixItNow 🔧**

### *Subtitle: "Your Trusted Home Service Platform"*

---

## 🚀 1. Mandatory Requirements (Strictest Compliance)

This project will be evaluated heavily based on these six foundational elements. Ensuring these are implemented correctly is **mandatory** for passing.

* **Consistent Error Responses:** All error responses across the entire API must strictly follow this JSON structure:
```json
{
  "success": false,
  "message": "Error descriptive message here",
  "errorDetails": { ... }
}

```


* **Input Validation:** Server-side validation must be implemented on all incoming request bodies and parameters with precise error messages.
* **Admin Credentials:** Provide active and working Admin email and password within the final documentation/submission.
* **Payment Integration:** Must exclusively integrate **SSLCommerz** for transaction processing. Fake payment flows (such as Cash on Delivery or Pay Later options) are **strictly forbidden**.

---

## 🛠️ 2. Tech Stack & Weightage Distribution

### Technical Specifications

* **Backend Runtime:** Node.js + Express
* **Language:** TypeScript *(Highly recommended for type-safety)*
* **Database & ORM:** PostgreSQL + Prisma ORM
* **Authentication:** JSON Web Tokens (JWT) with role-based evaluation

### Marks Weightage Breakdown

| Category | Weight | Focus Areas |
| --- | --- | --- |
| **Database Design & Schema** | **20%** | Prisma schema, exact relations, automated migrations, comprehensive seed script. |
| **Core Functionality** | **20%** | Authentication, strict RBAC, complete CRUD endpoints, customized middlewares. |
| **Error Handling & Validation** | **10%** | Input validation (Zod/Joi), structured global error filters, standard 404 handling. |
| **Payment Integration** | **10%** | SSLCommerz SDK/API setup, validation webhooks, state management. |

---

## 👥 3. System Roles & Access Control

Users must manually select one of these three fixed roles during registration (`/api/auth/register`).

* **Customer:** Browses services, views technician profiles, creates bookings, pays via SSLCommerz, tracks live status, and posts reviews.
* **Technician:** Sets up a professional profile, configures specific service types, sets weekly availability slots, manages incoming work orders.
* **Admin:** Moderates all user statuses (Ban/Unban), monitors global analytics/bookings, updates configuration and service categories.

---

## 🛣️ 4. API Endpoints Map

### A. Authentication & User Access

* `POST /api/auth/register` — Register a new account *(Must supply explicit user role)*.
* `POST /api/auth/login` — Authenticate user and sign a valid JWT.
* `GET /api/auth/me` — Retrieve credentials and details of the currently active session.

### B. Public Services & Discovery

* `GET /api/categories` — Fetch all existing service categories.
* `GET /api/services` — List available services with filtering options *(Type, location, dynamic rating, price)*.
* `GET /api/technicians` — Browse active service professionals with robust search filters.
* `GET /api/technicians/:id` — Target a specific technician's public profile containing aggregated customer reviews.

### C. Bookings (Customer Facing)

* `POST /api/bookings` — Dispatch a fresh booking contract request to a target technician.
* `GET /api/bookings` — Fetch current logged-in customer's booking matrix.
* `GET /api/bookings/:id` — View full itemized billing and timeline details for a single assignment.

### D. Technician Operations Panel

* `PUT /api/technician/profile` — Upsert technical skills, background context, and baseline rates.
* `PUT /api/technician/availability` — Block or release scheduling date/time slots.
* `GET /api/technician/bookings` — View matching service tickets routed to this specific technician.
* `PATCH /api/technician/bookings/:id` — Advance appointment lifecycle states (`ACCEPT`, `DECLINE`, `COMPLETE`).

### E. Integrated Payments (SSLCommerz)

* `POST /api/payments/create` — Initialize an explicit SSLCommerz gateway dynamic session for an `ACCEPTED` booking entry.
* `POST /api/payments/confirm` — Endpoint mapped for SSLCommerz server-to-server validation callbacks / IPN webhooks.
* `GET /api/payments` — Query historically processed transactions for the active client.
* `GET /api/payments/:id` — Check granular tracking properties of a distinct payment log.

### F. Reviews & Quality Management

* `POST /api/reviews` — Write feedback ratings after a booking enters the explicit `COMPLETED` stage.

### G. Administrative Governance

* `GET /api/admin/users` — Audit control over the entire system user pool.
* `PATCH /api/admin/users/:id` — Modify profile flags securely *(Ban or Unban execution)*.
* `GET /api/admin/bookings` — Global system-wide transaction ledger view.
* `GET /api/admin/categories` & `POST /api/admin/categories` — Read and write structural application categories.

---

## 🗄️ 5. Database Schema Blueprint

Implement the following relational database tables using Prisma definitions:

1. **Users:** Core user data, credentials hash, active state, and assigned authorization System Role.
2. **TechnicianProfiles:** Relates 1-to-1 with a User record; contains skills text, rating metrics, and specialized experience details.
3. **Categories:** Structural groups representing parent classifications *(e.g., Plumbing, Electrical, Cleaning)*.
4. **Services:** Concrete jobs tied to technicians, mapping out detailed pricing constraints.
5. **Bookings:** Core transaction states matching Customers, Services, and Technicians together with an assigned date/time schedule.
6. **Payments:** Records transaction identifiers (`transactionId`), payment state (`PENDING`, `COMPLETED`, `FAILED`), accurate currency amounts, tracking tokens, and timestamp data.
7. **Reviews:** Linked directly to completed booking tasks to allow users to leave 1-to-5 star ratings and reviews.

---

## 🔄 6. Application Workflow Diagrams

### Standard Customer Journey

```
[ Register / Create Account ]
              │
              ▼
[ Browse Public Service Catalog ]
              │
              ▼
[ Check Profiles & Reviews ]
              │
              ▼
[ Request Appointment/Booking ]
              │
              ▼
[ SSLCommerz Secure Gateway Payment ]
              │
              ▼
[ Monitor Progress & Track Live Status ]
              │
              ▼
[ Leave Professional Review & Feedback ]

```

### Booking Status Lifecycle State Machine

```
       ┌────────────────────────┐
       │       REQUESTED        │
       └────────────────────────┘
         /                    \
  (Tech Accepts)        (Tech Declines)
       /                        \
      ▼                          ▼
┌───────────┐              ┌───────────┐
│ ACCEPTED  │              │ DECLINED  │
└───────────┘              └───────────┘
      │
      ▼
┌───────────┐
│   PAID    │  ◄── (Processed strictly via SSLCommerz Gateway)
└───────────┘
      │
      ▼
┌───────────┐
│IN_PROGRESS│
└───────────┘
      │
      ▼
┌───────────┐
│ COMPLETED │  ◄── (Triggers unlocked access to /api/reviews)
└───────────┘

```

> 💡 **Lifecycle Boundary Rule:** Customers retain complete system access to cancel a scheduled booking at any point *prior* to the technician shifting the state to `IN_PROGRESS`.

---