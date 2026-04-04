-- CreateTable
CREATE TABLE "payment_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "studentName" VARCHAR(200) NOT NULL,
    "paymentNumber" VARCHAR(50) NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "paidAt" DATE NOT NULL,
    "note" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_records_tenantId_studentId_paidAt_idx" ON "payment_records"("tenantId", "studentId", "paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_records_tenantId_paymentNumber_key" ON "payment_records"("tenantId", "paymentNumber");

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
