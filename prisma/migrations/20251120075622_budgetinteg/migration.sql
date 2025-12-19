/*
  Warnings:

  - You are about to drop the `ApiAccessLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetRequestApprovalHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetRequestExportLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetRequestItemAllocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetRequestNotification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CachedDepartmentBudget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "budget_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ADJUSTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "request_type" AS ENUM ('REGULAR', 'PROJECT_BASED', 'URGENT', 'EMERGENCY');

-- DropForeignKey
ALTER TABLE "public"."BudgetRequestApprovalHistory" DROP CONSTRAINT "BudgetRequestApprovalHistory_budgetRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BudgetRequestExportLog" DROP CONSTRAINT "BudgetRequestExportLog_budgetRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BudgetRequestItemAllocation" DROP CONSTRAINT "BudgetRequestItemAllocation_budgetRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BudgetRequestNotification" DROP CONSTRAINT "BudgetRequestNotification_budgetRequestId_fkey";

-- DropTable
DROP TABLE "public"."ApiAccessLog";

-- DropTable
DROP TABLE "public"."BudgetRequest";

-- DropTable
DROP TABLE "public"."BudgetRequestApprovalHistory";

-- DropTable
DROP TABLE "public"."BudgetRequestExportLog";

-- DropTable
DROP TABLE "public"."BudgetRequestItemAllocation";

-- DropTable
DROP TABLE "public"."BudgetRequestNotification";

-- DropTable
DROP TABLE "public"."CachedDepartmentBudget";

-- DropTable
DROP TABLE "public"."SystemConfig";

-- DropEnum
DROP TYPE "public"."BudgetRequestStatus";

-- DropEnum
DROP TYPE "public"."PurchaseRequestStatus";

-- DropEnum
DROP TYPE "public"."RequestType";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "budget_category" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_request" (
    "id" SERIAL NOT NULL,
    "request_code" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "department_name" TEXT,
    "requested_by" TEXT NOT NULL,
    "requested_for" TEXT,
    "request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "status" "budget_request_status" NOT NULL DEFAULT 'PENDING',
    "purpose" TEXT,
    "remarks" TEXT,
    "request_type" "request_type" NOT NULL DEFAULT 'REGULAR',
    "pr_reference_code" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_by" TEXT,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "budget_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_request_item" (
    "id" SERIAL NOT NULL,
    "budget_request_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "description" TEXT,
    "requested_amount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "pr_item_id" INTEGER,

    CONSTRAINT "budget_request_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budget_category_code_key" ON "budget_category"("code");

-- CreateIndex
CREATE INDEX "budget_category_code_idx" ON "budget_category"("code");

-- CreateIndex
CREATE INDEX "budget_category_is_active_idx" ON "budget_category"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "budget_request_request_code_key" ON "budget_request"("request_code");

-- CreateIndex
CREATE INDEX "budget_request_department_id_idx" ON "budget_request"("department_id");

-- CreateIndex
CREATE INDEX "budget_request_status_idx" ON "budget_request"("status");

-- CreateIndex
CREATE INDEX "budget_request_request_type_idx" ON "budget_request"("request_type");

-- CreateIndex
CREATE INDEX "budget_request_created_at_idx" ON "budget_request"("created_at");

-- CreateIndex
CREATE INDEX "budget_request_item_budget_request_id_idx" ON "budget_request_item"("budget_request_id");

-- CreateIndex
CREATE INDEX "budget_request_item_category_id_idx" ON "budget_request_item"("category_id");

-- CreateIndex
CREATE INDEX "budget_request_item_pr_item_id_idx" ON "budget_request_item"("pr_item_id");

-- AddForeignKey
ALTER TABLE "budget_request_item" ADD CONSTRAINT "budget_request_item_budget_request_id_fkey" FOREIGN KEY ("budget_request_id") REFERENCES "budget_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_request_item" ADD CONSTRAINT "budget_request_item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
