-- CreateEnum
CREATE TYPE "UserBadge" AS ENUM ('NEWBIE', 'CONTRIBUTOR', 'CREATOR', 'TREND_STARTER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BADGE_UNLOCKED', 'NEW_COMMENT', 'NEW_UPVOTE', 'TURN_RELY', 'STORY_TRENDING');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "badge" "UserBadge",
ADD COLUMN     "storyCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
