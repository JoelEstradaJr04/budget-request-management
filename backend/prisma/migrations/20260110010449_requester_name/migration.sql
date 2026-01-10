/*
  Warnings:

  - Added the required column `requester_position` to the `budget_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "budget_request" ADD COLUMN     "requester_position" TEXT NOT NULL;
