-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SYSTEM', 'VIBER', 'SYSTEM_AND_VIBER');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('PRACTICE_INACTIVITY', 'ARRIVAL_REMINDER', 'CATEGORY_B_HOUR_MILESTONE', 'PAYMENT_REMINDER', 'PARENT_LESSON_REPORT');

-- CreateTable
CREATE TABLE "notification_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID,
    "practicalLessonId" UUID,
    "signalKey" VARCHAR(200) NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'INFO',
    "deliveryStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'SYSTEM',
    "title" VARCHAR(200) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "audienceLabel" VARCHAR(200) NOT NULL,
    "actionLabel" VARCHAR(120),
    "actionTarget" VARCHAR(240),
    "eventTime" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_records_tenantId_eventTime_idx" ON "notification_records"("tenantId", "eventTime");

-- CreateIndex
CREATE INDEX "notification_records_tenantId_kind_deliveryStatus_idx" ON "notification_records"("tenantId", "kind", "deliveryStatus");

-- CreateIndex
CREATE INDEX "notification_records_tenantId_studentId_eventTime_idx" ON "notification_records"("tenantId", "studentId", "eventTime");

-- CreateIndex
CREATE UNIQUE INDEX "notification_records_tenantId_signalKey_key" ON "notification_records"("tenantId", "signalKey");

-- AddForeignKey
ALTER TABLE "notification_records" ADD CONSTRAINT "notification_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_records" ADD CONSTRAINT "notification_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_records" ADD CONSTRAINT "notification_records_practicalLessonId_fkey" FOREIGN KEY ("practicalLessonId") REFERENCES "practical_lesson_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;
