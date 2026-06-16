/*
  Warnings:

  - A unique constraint covering the columns `[name,storyId]` on the table `Character` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "claimedByUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_storyId_key" ON "Character"("name", "storyId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
