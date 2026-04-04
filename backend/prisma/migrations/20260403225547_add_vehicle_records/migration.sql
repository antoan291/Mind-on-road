-- CreateEnum
CREATE TYPE "VehicleLifecycleStatus" AS ENUM ('ACTIVE', 'SERVICE_SOON', 'OUT_OF_SERVICE');

-- CreateTable
CREATE TABLE "vehicle_records" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "vehicleLabel" VARCHAR(200) NOT NULL,
    "instructorName" VARCHAR(200) NOT NULL,
    "categoryCode" VARCHAR(10) NOT NULL,
    "status" "VehicleLifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextInspection" DATE NOT NULL,
    "activeLessons" INTEGER NOT NULL DEFAULT 0,
    "operationalNote" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vehicle_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_records_tenantId_status_nextInspection_idx" ON "vehicle_records"("tenantId", "status", "nextInspection");

-- AddForeignKey
ALTER TABLE "vehicle_records" ADD CONSTRAINT "vehicle_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
