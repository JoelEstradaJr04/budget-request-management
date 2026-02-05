-- AlterTable
ALTER TABLE "budget_request" ADD COLUMN     "category" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "fiscal_period" TEXT,
ADD COLUMN     "fiscal_year" INTEGER DEFAULT 2025,
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "urgency_reason" TEXT;
