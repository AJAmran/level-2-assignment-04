/*
  Warnings:

  - You are about to drop the column `technicianId` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `technician_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slotId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_technicianId_fkey";

-- DropIndex
DROP INDEX "services_technicianId_idx";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "slotId" TEXT,
ALTER COLUMN "technicianId" DROP NOT NULL,
ALTER COLUMN "scheduledTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "technicianId",
ADD COLUMN     "image" VARCHAR(500);

-- AlterTable
ALTER TABLE "technician_profiles" DROP COLUMN "availability";

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_services" (
    "technicianId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" DOUBLE PRECISION,

    CONSTRAINT "technician_services_pkey" PRIMARY KEY ("technicianId","serviceId")
);

-- CreateIndex
CREATE INDEX "slots_technicianId_startTime_idx" ON "slots"("technicianId", "startTime");

-- CreateIndex
CREATE INDEX "slots_startTime_idx" ON "slots"("startTime");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_slotId_key" ON "bookings"("slotId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_services" ADD CONSTRAINT "technician_services_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_services" ADD CONSTRAINT "technician_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
