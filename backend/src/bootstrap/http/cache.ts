import {
  deleteCacheByPrefix,
  readCacheJson,
  writeCacheJson,
} from "../../infrastructure/cache/redis/redis-cache-client";
import type { AuthenticatedRequest, ReadAccessScope } from "./types";

export { readCacheJson, writeCacheJson, deleteCacheByPrefix };

export const TENANT_CACHE_TTL_SECONDS = 20;

export function buildTenantCacheKey(tenantId: string, scope: string) {
  return `tenant:${tenantId}:${scope}`;
}

export function buildScopedTenantCacheKey(
  auth: NonNullable<AuthenticatedRequest["auth"]>,
  accessScope: ReadAccessScope,
  scope: string,
) {
  return buildTenantCacheKey(auth.tenantId, `${scope}:${accessScope.cacheScope}`);
}

export async function deleteTenantReadCaches(tenantId: string) {
  await Promise.all([
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "students")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "payments")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "expenses")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "documents")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "invoices")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "vehicles")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "theory-groups")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "practical-lessons")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "notifications")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "determinator")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "ai-business")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "reports")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "exam-applications")),
    deleteCacheByPrefix(buildTenantCacheKey(tenantId, "settings-features")),
  ]);
}
