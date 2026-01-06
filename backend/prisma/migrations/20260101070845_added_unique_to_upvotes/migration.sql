/*
  Warnings:

  - A unique constraint covering the columns `[turnId,userId]` on the table `TurnUpvote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TurnUpvote_turnId_userId_key" ON "TurnUpvote"("turnId", "userId");
