-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('FOCUS_REVIEW', 'DECISION_REFLECTION', 'GENERAL_NOTES', 'WEEKLY_REVIEW', 'OTHER');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'GENERAL_NOTES',
    "tags" TEXT[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "focusIds" TEXT[],
    "decisionIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_isArchived_idx" ON "Document"("isArchived");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
