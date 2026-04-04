-- CreateEnum
CREATE TYPE "ExamApplicationStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'SENT', 'RECEIVED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "exam_application_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "studentName" VARCHAR(200) NOT NULL,
    "categoryCode" VARCHAR(10) NOT NULL,
    "applicationNumber" VARCHAR(50) NOT NULL,
    "status" "ExamApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "examOfficeName" VARCHAR(200) NOT NULL,
    "preferredExamDate" DATE,
    "requiredDataSnapshot" JSONB NOT NULL,
    "missingRequirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "statusNote" VARCHAR(1000),
    "submittedAt" TIMESTAMPTZ(6),
    "decidedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_application_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_application_revision_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examApplicationId" UUID NOT NULL,
    "actorName" VARCHAR(200) NOT NULL,
    "changeSummary" VARCHAR(500) NOT NULL,
    "previousSnapshot" JSONB NOT NULL,
    "nextSnapshot" JSONB NOT NULL,
    "changedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_application_revision_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_application_records_tenantId_studentId_createdAt_idx" ON "exam_application_records"("tenantId", "studentId", "createdAt");

-- CreateIndex
CREATE INDEX "exam_application_records_tenantId_status_createdAt_idx" ON "exam_application_records"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "exam_application_records_tenantId_applicationNumber_key" ON "exam_application_records"("tenantId", "applicationNumber");

-- CreateIndex
CREATE INDEX "exam_application_revision_records_tenantId_examApplicationI_idx" ON "exam_application_revision_records"("tenantId", "examApplicationId", "changedAt");

-- AddForeignKey
ALTER TABLE "exam_application_records" ADD CONSTRAINT "exam_application_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_application_records" ADD CONSTRAINT "exam_application_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_application_revision_records" ADD CONSTRAINT "exam_application_revision_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_application_revision_records" ADD CONSTRAINT "exam_application_revision_records_examApplicationId_fkey" FOREIGN KEY ("examApplicationId") REFERENCES "exam_application_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
