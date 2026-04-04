-- CreateTable
CREATE TABLE "expense_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "expenseType" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "amount" INTEGER NOT NULL,
    "vatAmount" INTEGER NOT NULL DEFAULT 0,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "source" VARCHAR(200) NOT NULL,
    "counterparty" VARCHAR(200) NOT NULL,
    "note" VARCHAR(1000) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "affectsOperationalExpense" BOOLEAN NOT NULL DEFAULT true,
    "entryDate" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "expense_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_records_tenantId_entryDate_idx" ON "expense_records"("tenantId", "entryDate");

-- CreateIndex
CREATE INDEX "expense_records_tenantId_expenseType_status_idx" ON "expense_records"("tenantId", "expenseType", "status");

-- AddForeignKey
ALTER TABLE "expense_records" ADD CONSTRAINT "expense_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
