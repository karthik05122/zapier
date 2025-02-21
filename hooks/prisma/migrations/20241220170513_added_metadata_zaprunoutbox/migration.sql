/*
  Warnings:

  - Added the required column `metadata` to the `ZapRunOutbox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ZapRunOutbox" ADD COLUMN     "metadata" JSONB NOT NULL;
