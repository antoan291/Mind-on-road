-- CreateEnum
CREATE TYPE "TheoryLectureAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED', 'LATE');

-- CreateTable
CREATE TABLE "theory_lecture_attendance_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "theoryGroupId" UUID NOT NULL,
    "theoryLectureId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "status" "TheoryLectureAttendanceStatus" NOT NULL,
    "viberSent" BOOLEAN NOT NULL DEFAULT false,
    "markedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "markedBy" VARCHAR(200),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "theory_lecture_attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "theory_lecture_attendance_records_tenantId_theoryGroupId_th_idx" ON "theory_lecture_attendance_records"("tenantId", "theoryGroupId", "theoryLectureId");

-- CreateIndex
CREATE INDEX "theory_lecture_attendance_records_tenantId_studentId_marked_idx" ON "theory_lecture_attendance_records"("tenantId", "studentId", "markedAt");

-- CreateIndex
CREATE UNIQUE INDEX "theory_lecture_attendance_records_tenantId_theoryLectureId__key" ON "theory_lecture_attendance_records"("tenantId", "theoryLectureId", "studentId");

-- AddForeignKey
ALTER TABLE "theory_lecture_attendance_records" ADD CONSTRAINT "theory_lecture_attendance_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theory_lecture_attendance_records" ADD CONSTRAINT "theory_lecture_attendance_records_theoryLectureId_fkey" FOREIGN KEY ("theoryLectureId") REFERENCES "theory_lecture_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theory_lecture_attendance_records" ADD CONSTRAINT "theory_lecture_attendance_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
