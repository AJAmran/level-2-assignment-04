/*
  Warnings:

  - You are about to drop the column `isBanned` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "isBanned",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
