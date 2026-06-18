-- CreateEnum
CREATE TYPE "ArcSize" AS ENUM ('SHORT', 'MEDIUM', 'EPIC');

-- CreateEnum
CREATE TYPE "ArcStage" AS ENUM ('SETUP', 'RISING', 'CLIMAX', 'RESOLUTION');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "arcSize" "ArcSize" NOT NULL DEFAULT 'SHORT',
ADD COLUMN     "arcStage" "ArcStage" NOT NULL DEFAULT 'SETUP',
ADD COLUMN     "maxTurns" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "status" "StoryStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "turnCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StoryVote" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryVote_storyId_idx" ON "StoryVote"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryVote_storyId_userId_key" ON "StoryVote"("storyId", "userId");

-- AddForeignKey
ALTER TABLE "StoryVote" ADD CONSTRAINT "StoryVote_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryVote" ADD CONSTRAINT "StoryVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
