-- AlterTable: Add privacy preference for push notification titles
ALTER TABLE "User" ADD COLUMN "showTaskTitles" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Remove obsolete email reminder fields (expand-then-contract)
ALTER TABLE "User" DROP COLUMN IF EXISTS "dailyNotificationTime";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "deadlineNotified";
