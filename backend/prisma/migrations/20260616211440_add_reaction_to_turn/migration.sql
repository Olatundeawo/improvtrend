/*
  Warnings:

  - The values [NEW_UPVOTE] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `TurnUpvote` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('SPICY', 'PLOT_TWIST', 'FUNNY', 'BEST_LINE');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('BADGE_UNLOCKED', 'NEW_COMMENT', 'NEW_REACTION', 'TURN_RELY', 'STORY_TRENDING');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "TurnUpvote" DROP CONSTRAINT "TurnUpvote_turnId_fkey";

-- DropForeignKey
ALTER TABLE "TurnUpvote" DROP CONSTRAINT "TurnUpvote_userId_fkey";

-- DropTable
DROP TABLE "TurnUpvote";

-- CreateTable
CREATE TABLE "TurnReaction" (
    "id" TEXT NOT NULL,
    "turnId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TurnReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TurnReaction_turnId_idx" ON "TurnReaction"("turnId");

-- CreateIndex
CREATE INDEX "TurnReaction_userId_idx" ON "TurnReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TurnReaction_turnId_userId_type_key" ON "TurnReaction"("turnId", "userId", "type");

-- AddForeignKey
ALTER TABLE "TurnReaction" ADD CONSTRAINT "TurnReaction_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "Turn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnReaction" ADD CONSTRAINT "TurnReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
