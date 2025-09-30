/*
  Warnings:

  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "dueDate" TIMESTAMP(3),
DROP COLUMN "priority",
ADD COLUMN     "priority" "public"."Priority" NOT NULL DEFAULT 'medium',
DROP COLUMN "status",
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'pending';
