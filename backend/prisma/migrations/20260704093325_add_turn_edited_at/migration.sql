/*
  Warnings:

  - You are about to drop the column `editedAt` on the `TurnReaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Turn" ADD COLUMN     "editedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TurnReaction" DROP COLUMN "editedAt";
