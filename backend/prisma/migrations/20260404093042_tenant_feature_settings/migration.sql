-- CreateTable
CREATE TABLE "tenant_feature_settings" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "featureKey" VARCHAR(50) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_feature_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tenant_feature_settings_tenantId_enabled_idx" ON "tenant_feature_settings"("tenantId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_feature_settings_tenantId_featureKey_key" ON "tenant_feature_settings"("tenantId", "featureKey");

-- AddForeignKey
ALTER TABLE "tenant_feature_settings" ADD CONSTRAINT "tenant_feature_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
