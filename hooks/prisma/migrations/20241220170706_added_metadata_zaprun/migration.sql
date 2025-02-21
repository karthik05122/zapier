/*
  Warnings:

  - You are about to drop the column `metadata` on the `ZapRunOutbox` table. All the data in the column will be lost.
  - Added the required column `metadata` to the `ZapRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ZapRun" ADD COLUMN     "metadata" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ZapRunOutbox" DROP COLUMN "metadata";
