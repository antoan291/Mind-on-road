---
name: database-migration
description: Use when a task involves Prisma/PostgreSQL schema changes, data migrations, indexes, constraints, tenant isolation, or migration rollout risk.
---

# Database Migration

## Workflow

1. Read `AGENTS.md`, `agent/database/README.md`, and `agent/architecture/README.md`.
2. Inspect relevant schema, migration, module, and test files.
3. Check tenant scoping, uniqueness, foreign keys, check constraints, indexes, and money/timestamp conventions.
4. Assess rollout safety:
   - lock risk;
   - backward compatibility;
   - data backfill/default behavior;
   - destructive operations;
   - rollback/recovery path.
5. Implement the smallest safe schema/code change or return a review finding with concrete remediation.
6. Run targeted Prisma/database verification commands if available locally.
7. Report changed files, migration risks, and what was verified.

Do not present a destructive migration as safe unless backup/restore and rollback implications are explicit.
