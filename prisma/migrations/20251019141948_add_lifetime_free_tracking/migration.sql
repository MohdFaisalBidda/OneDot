/*
  Warnings:

  - You are about to drop the column `emailDigest` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pushNotifications` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyReports` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailDigest",
DROP COLUMN "pushNotifications",
DROP COLUMN "weeklyReports",
ADD COLUMN     "isLifetimeFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_userNumber_key" ON "User"("userNumber");
