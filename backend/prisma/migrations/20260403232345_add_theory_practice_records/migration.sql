-- CreateEnum
CREATE TYPE "TheoryGroupStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'UPCOMING');

-- CreateEnum
CREATE TYPE "TheoryLectureStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PracticalLessonStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'NO_SHOW', 'LATE');

-- CreateEnum
CREATE TYPE "PracticalLessonPaymentStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "PracticalLessonEvaluationStatus" AS ENUM ('PENDING', 'COMPLETED', 'NOT_REQUIRED');

-- CreateTable
CREATE TABLE "theory_group_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "categoryCode" VARCHAR(10) NOT NULL,
    "scheduleLabel" VARCHAR(200) NOT NULL,
    "instructorName" VARCHAR(200) NOT NULL,
    "daiCode" VARCHAR(50) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "totalLectures" INTEGER NOT NULL DEFAULT 0,
    "completedLectures" INTEGER NOT NULL DEFAULT 0,
    "activeStudents" INTEGER NOT NULL DEFAULT 0,
    "studentsWithAbsences" INTEGER NOT NULL DEFAULT 0,
    "studentsNeedingRecovery" INTEGER NOT NULL DEFAULT 0,
    "averageAttendance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "TheoryGroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "theory_group_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theory_lecture_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "theoryGroupId" UUID NOT NULL,
    "lectureNumber" INTEGER NOT NULL,
    "topic" VARCHAR(200) NOT NULL,
    "lectureDate" DATE NOT NULL,
    "startTimeLabel" VARCHAR(20) NOT NULL,
    "endTimeLabel" VARCHAR(20) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 90,
    "location" VARCHAR(120) NOT NULL,
    "status" "TheoryLectureStatus" NOT NULL DEFAULT 'SCHEDULED',
    "presentCount" INTEGER NOT NULL DEFAULT 0,
    "absentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "theory_lecture_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practical_lesson_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "studentName" VARCHAR(200) NOT NULL,
    "instructorName" VARCHAR(200) NOT NULL,
    "vehicleLabel" VARCHAR(200) NOT NULL,
    "categoryCode" VARCHAR(10) NOT NULL,
    "lessonDate" DATE NOT NULL,
    "startTimeLabel" VARCHAR(20) NOT NULL,
    "endTimeLabel" VARCHAR(20) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 90,
    "status" "PracticalLessonStatus" NOT NULL DEFAULT 'SCHEDULED',
    "paymentStatus" "PracticalLessonPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "evaluationStatus" "PracticalLessonEvaluationStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "routeLabel" VARCHAR(200),
    "startLocation" VARCHAR(200),
    "endLocation" VARCHAR(200),
    "notes" VARCHAR(1000),
    "kmDriven" INTEGER,
    "rating" INTEGER,
    "parentNotificationSent" BOOLEAN NOT NULL DEFAULT false,
    "parentPerformanceSummary" VARCHAR(1000),
    "createdBy" VARCHAR(200),
    "updatedBy" VARCHAR(200),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "practical_lesson_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "theory_group_records_tenantId_status_startDate_idx" ON "theory_group_records"("tenantId", "status", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "theory_group_records_tenantId_daiCode_key" ON "theory_group_records"("tenantId", "daiCode");

-- CreateIndex
CREATE INDEX "theory_lecture_records_tenantId_theoryGroupId_lectureDate_idx" ON "theory_lecture_records"("tenantId", "theoryGroupId", "lectureDate");

-- CreateIndex
CREATE INDEX "theory_lecture_records_tenantId_status_lectureDate_idx" ON "theory_lecture_records"("tenantId", "status", "lectureDate");

-- CreateIndex
CREATE INDEX "practical_lesson_records_tenantId_studentId_lessonDate_idx" ON "practical_lesson_records"("tenantId", "studentId", "lessonDate");

-- CreateIndex
CREATE INDEX "practical_lesson_records_tenantId_status_lessonDate_idx" ON "practical_lesson_records"("tenantId", "status", "lessonDate");

-- CreateIndex
CREATE INDEX "practical_lesson_records_tenantId_instructorName_lessonDate_idx" ON "practical_lesson_records"("tenantId", "instructorName", "lessonDate");

-- AddForeignKey
ALTER TABLE "theory_group_records" ADD CONSTRAINT "theory_group_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theory_lecture_records" ADD CONSTRAINT "theory_lecture_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theory_lecture_records" ADD CONSTRAINT "theory_lecture_records_theoryGroupId_fkey" FOREIGN KEY ("theoryGroupId") REFERENCES "theory_group_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_lesson_records" ADD CONSTRAINT "practical_lesson_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_lesson_records" ADD CONSTRAINT "practical_lesson_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
