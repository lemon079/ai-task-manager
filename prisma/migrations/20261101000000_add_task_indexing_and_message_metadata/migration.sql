-- AlterTable Task
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "dueTime" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "indexedAt" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "indexPending" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Task_indexPending_idx" ON "Task"("indexPending");

-- AlterTable Message
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_chatId_idx" ON "Message"("chatId");
CREATE INDEX IF NOT EXISTS "Message_userId_idx" ON "Message"("userId");
