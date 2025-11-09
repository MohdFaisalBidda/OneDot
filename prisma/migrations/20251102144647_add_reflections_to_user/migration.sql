/*
  Warnings:

  - You are about to drop the column `isLifetimeFree` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userNumber` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_userNumber_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isLifetimeFree",
DROP COLUMN "userNumber";

-- CreateTable
CREATE TABLE "Reflection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reflection_userId_idx" ON "Reflection"("userId");

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
