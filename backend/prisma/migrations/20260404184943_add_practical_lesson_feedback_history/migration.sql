-- AlterTable
ALTER TABLE "practical_lesson_records" ADD COLUMN     "studentFeedbackComment" VARCHAR(1000),
ADD COLUMN     "studentFeedbackRating" INTEGER,
ADD COLUMN     "studentFeedbackSubmittedAt" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "practical_lesson_revision_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "practicalLessonId" UUID NOT NULL,
    "actorName" VARCHAR(200) NOT NULL,
    "changeSummary" VARCHAR(500) NOT NULL,
    "previousSnapshot" JSONB NOT NULL,
    "nextSnapshot" JSONB NOT NULL,
    "changedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practical_lesson_revision_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "practical_lesson_revision_records_tenantId_practicalLessonI_idx" ON "practical_lesson_revision_records"("tenantId", "practicalLessonId", "changedAt");

-- AddForeignKey
ALTER TABLE "practical_lesson_revision_records" ADD CONSTRAINT "practical_lesson_revision_records_practicalLessonId_fkey" FOREIGN KEY ("practicalLessonId") REFERENCES "practical_lesson_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
