-- AlterTable
ALTER TABLE "practical_lesson_records" ADD COLUMN     "parentFeedbackComment" VARCHAR(1000),
ADD COLUMN     "parentFeedbackRating" INTEGER,
ADD COLUMN     "parentFeedbackSubmittedAt" TIMESTAMPTZ(6);
