/*
  Warnings:

  - A unique constraint covering the columns `[turnId,userId]` on the table `TurnReaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'CLAIM_EXPIRY_WARNING';
ALTER TYPE "NotificationType" ADD VALUE 'CLAIM_AUTO_RELEASED';

-- DropIndex
DROP INDEX "TurnReaction_turnId_userId_type_key";

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "claimExpiresAt" TIMESTAMP(3),
ADD COLUMN     "lastTurnAt" TIMESTAMP(3),
ADD COLUMN     "warningSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Character_claimExpiresAt_idx" ON "Character"("claimExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TurnReaction_turnId_userId_key" ON "TurnReaction"("turnId", "userId");
