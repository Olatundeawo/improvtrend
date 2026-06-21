/*
  Warnings:

  - You are about to drop the column `badge` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('NEWCOMER', 'STORYTELLER', 'SCRIBE', 'AUTHOR', 'GRAND_NARRATOR');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('NEWBIE', 'CONTRIBUTOR', 'CREATOR', 'TREND_STARTER', 'PLOT_TWISTER', 'SCENE_SETTER', 'NARRATOR_KING', 'SPEED_WRITER', 'CHARACTER_ACTOR');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'LEVEL_UP';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "badge",
ADD COLUMN     "level" "UserLevel" NOT NULL DEFAULT 'NEWCOMER';

-- DropEnum
DROP TYPE "UserBadge";

-- CreateTable
CREATE TABLE "UserBadgeRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badge" "BadgeType" NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadgeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBadgeRecord_userId_idx" ON "UserBadgeRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadgeRecord_userId_badge_key" ON "UserBadgeRecord"("userId", "badge");

-- AddForeignKey
ALTER TABLE "UserBadgeRecord" ADD CONSTRAINT "UserBadgeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
