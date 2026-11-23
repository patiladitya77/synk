/*
  Warnings:

  - Changed the type of `boardId` on the `BoardOperation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BoardOperation" DROP COLUMN "boardId",
ADD COLUMN     "boardId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "BoardOperation_boardId_idx" ON "BoardOperation"("boardId");

-- AddForeignKey
ALTER TABLE "BoardOperation" ADD CONSTRAINT "BoardOperation_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
