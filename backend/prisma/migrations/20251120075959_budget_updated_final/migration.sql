-- CreateTable
CREATE TABLE "attachment" (
    "id" SERIAL NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "description" TEXT,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachment_entity_type_entity_id_idx" ON "attachment"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "attachment_entity_type_idx" ON "attachment"("entity_type");

-- CreateIndex
CREATE INDEX "attachment_file_type_idx" ON "attachment"("file_type");

-- CreateIndex
CREATE INDEX "attachment_is_deleted_idx" ON "attachment"("is_deleted");
