/**
 * Prisma ORM Client Singleton
 * Configures PrismaClient with the PostgreSQL adapter for database operations.
 * Re-exported as a singleton so all modules share one connection pool.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

/** PostgreSQL driver adapter for Prisma */
const adapter = new PrismaPg({ connectionString });

/** Singleton PrismaClient instance used across the entire application */
const prisma = new PrismaClient({ adapter });

export { prisma };
