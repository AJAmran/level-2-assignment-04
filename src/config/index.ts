/**
 * Application Configuration Module
 * Loads and exports environment variables for the application.
 * All sensitive credentials (JWT secrets, DB URL, payment gateway keys) are read from .env.
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
    /** Server port number, defaults to 5000 */
    port: process.env.PORT || 5000,
    /** PostgreSQL connection string for Prisma ORM */
    database_url: process.env.DATABASE_URL || "",
    /** Application base URL for CORS and payment callbacks */
    app_url: process.env.APP_URL || "",
    /** Secret key for signing JWT access tokens */
    jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
    /** Secret key for signing JWT refresh tokens */
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
    /** Access token expiry duration (e.g. '1d', '24h') */
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
    /** Refresh token expiry duration (e.g. '7d') */
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
    /** bcrypt salt rounds for password hashing */
    salt_rounds: process.env.SALT_ROUNDS,
    /** SSLCommerz sandbox/live store ID */
    storeId: process.env.Store_ID!,
    /** SSLCommerz sandbox/live store password */
    storePasswd: process.env.Store_Password!,
}