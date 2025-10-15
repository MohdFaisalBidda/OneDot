-- CreateEnum
CREATE TYPE "UserTheme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "emailDigest" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "theme" "UserTheme" NOT NULL DEFAULT 'LIGHT',
ADD COLUMN     "weeklyReports" BOOLEAN NOT NULL DEFAULT false;
