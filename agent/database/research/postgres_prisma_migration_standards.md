# PostgreSQL And Prisma Migration Standards

## Goal

Define safe schema and migration rules for PostgreSQL + Prisma in a multi-tenant SaaS system.

## Schema Rules

- Every tenant-owned business table must carry explicit tenant scope.
- Prefer database constraints for core invariants instead of app-only checks.
- Use integer minor units for money.
- Use `timestamptz` and store business timestamps in UTC.
- Add indexes based on real tenant-first read/write paths, not guesswork.
- Keep document metadata in PostgreSQL and file binaries in object storage.

## Migration Safety Rules

- Treat destructive changes as high-risk by default.
- Separate additive rollout from cleanup when backward compatibility matters.
- Avoid long locks on large tables; evaluate migration shape before applying it.
- For new non-null columns, plan defaults/backfill explicitly.
- For enum/status changes, check all old and new writers/readers during rollout.
- Before data-loss operations, define backup, restore, and rollback implications.

## Prisma Rules

- Keep schema naming and relation direction understandable for the business domain.
- Review generated migrations before trusting them.
- Do not let Prisma schema drift from the intended PostgreSQL constraints/indexes.
- For critical changes, verify both generated SQL and runtime query behavior.

## Review Checklist

- Is tenant scope enforced in schema and query path?
- Are uniqueness and referential integrity correct?
- Is money/timestamp modeling safe?
- Are indexes aligned with expected queries?
- Is rollout backward compatible enough for deployment order?
- Is data backfill defined and testable?
- Is rollback or restore path clear?
