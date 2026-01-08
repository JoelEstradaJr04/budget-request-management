/*
  Warnings:

  - Added the required column `approved_amount` to the `budget_request_item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "budget_request_item" ADD COLUMN     "approved_amount" DECIMAL(14,2) NOT NULL;
