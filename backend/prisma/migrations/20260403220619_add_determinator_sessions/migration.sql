-- CreateTable
CREATE TABLE "determinator_sessions" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "studentName" VARCHAR(200) NOT NULL,
    "registrationNumber" VARCHAR(50) NOT NULL,
    "measuredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autoTempoCorrectReactions" INTEGER NOT NULL,
    "autoTempoWrongReactions" INTEGER NOT NULL,
    "autoTempoSuccessCoefficient" DOUBLE PRECISION NOT NULL,
    "forcedTempoCorrectReactions" INTEGER NOT NULL,
    "forcedTempoDelayedReactions" INTEGER NOT NULL,
    "forcedTempoWrongResults" INTEGER NOT NULL,
    "forcedTempoMissedStimuli" INTEGER NOT NULL,
    "forcedTempoSuccessCoefficient" DOUBLE PRECISION NOT NULL,
    "overallResult" VARCHAR(1000) NOT NULL,
    "instructorNote" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "determinator_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "determinator_sessions_tenantId_studentId_measuredAt_idx" ON "determinator_sessions"("tenantId", "studentId", "measuredAt");

-- AddForeignKey
ALTER TABLE "determinator_sessions" ADD CONSTRAINT "determinator_sessions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "determinator_sessions" ADD CONSTRAINT "determinator_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
