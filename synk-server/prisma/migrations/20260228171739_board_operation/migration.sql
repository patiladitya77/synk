-- CreateTable
CREATE TABLE "BoardOperation" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardOperation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoardOperation_boardId_idx" ON "BoardOperation"("boardId");
