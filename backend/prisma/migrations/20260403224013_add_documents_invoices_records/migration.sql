-- CreateEnum
CREATE TYPE "DocumentOwnerType" AS ENUM ('STUDENT', 'INSTRUCTOR', 'VEHICLE', 'SCHOOL');

-- CreateEnum
CREATE TYPE "DocumentLifecycleStatus" AS ENUM ('VALID', 'EXPIRING_SOON', 'EXPIRED', 'MISSING');

-- CreateEnum
CREATE TYPE "InvoiceLifecycleStatus" AS ENUM ('DRAFT', 'ISSUED', 'CANCELED', 'CORRECTED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "InvoicePaymentLinkStatus" AS ENUM ('LINKED', 'NOT_LINKED', 'PARTIAL');

-- CreateTable
CREATE TABLE "document_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID,
    "name" VARCHAR(200) NOT NULL,
    "ownerType" "DocumentOwnerType" NOT NULL,
    "ownerName" VARCHAR(200) NOT NULL,
    "ownerRef" VARCHAR(100),
    "category" VARCHAR(100) NOT NULL,
    "documentNo" VARCHAR(100),
    "issueDate" DATE NOT NULL,
    "expiryDate" DATE,
    "status" "DocumentLifecycleStatus" NOT NULL DEFAULT 'VALID',
    "fileUrl" VARCHAR(500),
    "notes" VARCHAR(1000),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "document_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "invoiceNumber" VARCHAR(50) NOT NULL,
    "invoiceDate" DATE NOT NULL,
    "recipientName" VARCHAR(200) NOT NULL,
    "categoryCode" VARCHAR(10) NOT NULL,
    "invoiceReason" VARCHAR(200) NOT NULL,
    "packageType" VARCHAR(100) NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'BGN',
    "status" "InvoiceLifecycleStatus" NOT NULL DEFAULT 'ISSUED',
    "paymentLinkStatus" "InvoicePaymentLinkStatus" NOT NULL DEFAULT 'LINKED',
    "paymentNumber" VARCHAR(50),
    "paymentStatus" VARCHAR(50),
    "createdBy" VARCHAR(200) NOT NULL,
    "createdDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedBy" VARCHAR(200) NOT NULL,
    "notes" VARCHAR(1000),
    "issuedDate" DATE,
    "dueDate" DATE,
    "vatAmount" INTEGER NOT NULL DEFAULT 0,
    "subtotalAmount" INTEGER NOT NULL DEFAULT 0,
    "wasCorrected" BOOLEAN NOT NULL DEFAULT false,
    "correctionReason" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoice_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_records_tenantId_ownerType_status_idx" ON "document_records"("tenantId", "ownerType", "status");

-- CreateIndex
CREATE INDEX "document_records_tenantId_studentId_idx" ON "document_records"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "invoice_records_tenantId_studentId_invoiceDate_idx" ON "invoice_records"("tenantId", "studentId", "invoiceDate");

-- CreateIndex
CREATE INDEX "invoice_records_tenantId_status_invoiceDate_idx" ON "invoice_records"("tenantId", "status", "invoiceDate");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_records_tenantId_invoiceNumber_key" ON "invoice_records"("tenantId", "invoiceNumber");

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_records" ADD CONSTRAINT "invoice_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_records" ADD CONSTRAINT "invoice_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
