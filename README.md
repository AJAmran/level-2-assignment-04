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
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/fixitnow"
   JWT_ACCESS_SECRET="your_access_secret"
   JWT_REFRESH_SECRET="your_refresh_secret"
   STORE_ID="your_sslcommerz_store_id"
   STORE_PASS="your_sslcommerz_store_pass"
   APP_URL="http://localhost:5000"
   ```
4. **Run Database Migrations**:
   ```bash
   npm run prisma:migrate
   ```
5. **Seed the Database (Admin Setup)**:
   ```bash
   npm run seed
   ```
   *This creates the default admin user: `admin@fixitnow.com` with password `admin12345`.*
6. **Start the Development Server**:
   ```bash
   npm run dev
   ```

## API Documentation
The complete API specification is available in the `swagger.yaml` file located in the project root. You can import this file directly into Swagger UI or Postman to explore and test the endpoints. Additionally, a `postman_collection.json` has been provided for ease of use.
