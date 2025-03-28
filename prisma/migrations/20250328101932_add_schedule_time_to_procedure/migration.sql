/*
  Warnings:

  - Added the required column `scheduleTime` to the `Procedure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Procedure" ADD COLUMN     "scheduleTime" TEXT NOT NULL;
