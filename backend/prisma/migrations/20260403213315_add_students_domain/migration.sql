-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "StudentEnrollmentStatus" AS ENUM ('ACTIVE', 'FAILED_EXAM', 'PASSED', 'PAUSED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "StudentTrainingMode" AS ENUM ('STANDARD_PACKAGE', 'LICENSED_MANUAL_HOURS');

-- CreateEnum
CREATE TYPE "StudentRegisterMode" AS ENUM ('ELECTRONIC', 'PAPER', 'HYBRID');

-- CreateEnum
CREATE TYPE "ParentContactStatus" AS ENUM ('DISABLED', 'ENABLED');

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "displayName" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(320),
    "nationalId" VARCHAR(32),
    "birthDate" DATE,
    "address" VARCHAR(300),
    "educationLevel" VARCHAR(100),
    "parentName" VARCHAR(200),
    "parentPhone" VARCHAR(50),
    "parentEmail" VARCHAR(320),
    "parentContactStatus" "ParentContactStatus" NOT NULL DEFAULT 'DISABLED',
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "categoryCode" VARCHAR(10) NOT NULL,
    "status" "StudentEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "trainingMode" "StudentTrainingMode" NOT NULL DEFAULT 'STANDARD_PACKAGE',
    "registerMode" "StudentRegisterMode" NOT NULL DEFAULT 'ELECTRONIC',
    "theoryGroupNumber" VARCHAR(50),
    "assignedInstructorName" VARCHAR(200),
    "enrollmentDate" DATE NOT NULL,
    "expectedArrivalDate" DATE,
    "previousLicenseCategory" VARCHAR(20),
    "packageHours" INTEGER NOT NULL DEFAULT 0,
    "additionalHours" INTEGER NOT NULL DEFAULT 0,
    "completedHours" INTEGER NOT NULL DEFAULT 0,
    "failedExamAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastPracticeAt" TIMESTAMPTZ(6),
    "notes" VARCHAR(1000),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "students_tenantId_status_createdAt_idx" ON "students"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "students_tenantId_displayName_idx" ON "students"("tenantId", "displayName");

-- CreateIndex
CREATE UNIQUE INDEX "students_tenantId_nationalId_key" ON "students"("tenantId", "nationalId");

-- CreateIndex
CREATE INDEX "student_enrollments_tenantId_status_categoryCode_idx" ON "student_enrollments"("tenantId", "status", "categoryCode");

-- CreateIndex
CREATE INDEX "student_enrollments_tenantId_studentId_idx" ON "student_enrollments"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "student_enrollments_tenantId_assignedInstructorName_idx" ON "student_enrollments"("tenantId", "assignedInstructorName");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
