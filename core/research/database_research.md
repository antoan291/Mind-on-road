# Database Research Notes

## Goal

Тези бележки събират стабилни принципи за проектиране на база данни за SaaS продукти с PostgreSQL, multi-tenant модел, чувствителни документи и дългосрочна поддръжка.

## Core principles from current reference set

- Prefer a simple modular monolith over premature microservices when transactional consistency matters.
- Treat PostgreSQL as the primary source of truth for business data.
- Design every tenant-owned table with explicit tenant scoping from day one.
- Keep auditability, recoverability, and security in the database design itself, not only in application code.
- Model money in integer minor units, not floating point values.
- Separate operational tables from heavy reports and derived read models when complexity grows.

## PostgreSQL decisions that should stay stable

- Use tenant_id on domain tables and index by tenant-first access patterns.
- Use timestamptz and store timestamps in UTC.
- Use row-level security only for carefully chosen sensitive areas and keep authorization rules explicit.
- Use unique constraints, foreign keys, and check constraints aggressively for business correctness.
- Use partial indexes and composite indexes based on real read paths.
- Keep document metadata in PostgreSQL and store file binaries in object storage.

## Reliability and operations

- Point-in-time recovery is a core requirement, not a nice-to-have.
- WAL archiving plus base backups is the correct baseline for serious PostgreSQL recovery.
- Every critical table design should assume later auditing, export, and restore needs.
- Feature flags and paid modules should be represented as real tenant-level data, not only UI state.
- Background jobs that change business state should stay traceable to database records and audit logs.

## Current source anchors

- Designing Data-Intensive Applications
- System Design Interview
- Joga technology and schema references
- PostgreSQL official docs on RLS and PITR
- Prisma Postgres documentation

## Next expansion points

- Add table-by-table notes for tenant isolation, audit fields, and indexing.
- Add naming conventions for IDs, timestamps, status columns, and money columns.
- Add a separate note for document storage and OCR metadata flows.
- Add restore drills and migration discipline rules once the backend implementation starts.
