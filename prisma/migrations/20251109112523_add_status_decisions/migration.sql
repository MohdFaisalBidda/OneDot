-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PENDING', 'ACHIEVED', 'NOT_ACHIEVED', 'PARTIALLY_ACHIEVED');

-- AlterTable
ALTER TABLE "Decision" ADD COLUMN     "status" "DecisionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Focus" ALTER COLUMN "status" SET DEFAULT 'PENDING';
