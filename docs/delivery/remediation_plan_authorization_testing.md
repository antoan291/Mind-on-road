# Authorization, Testing, And Architecture Remediation Plan

## Purpose

This document tracks the highest-priority remediation work identified during the latest repository review.

It is intentionally written as an active task list, not as permanent historical documentation.

Rule for maintenance:

- when a task is fully completed and verified, delete it from this file;
- if only part of a task is completed, keep the task and update the remaining scope;
- do not leave completed tasks here as archive noise.

## Delivery Rules

- prioritize security, tenant isolation, and financial correctness before cleanup work;
- do not merge authorization refactors without integration coverage;
- every task that changes behavior must include verification;
- use tenant-scoped IDs as the source of truth, not mutable names or emails;
- keep routers thin and move business rules into application services.

## P0 - Do First

### 2. Remove name-based and email-based identity fallback from authorization-critical paths

Why:

- mutable names and emails are still used as fallback identifiers in visibility and assignment logic;
- a rename can silently break access, counts, or reporting.

Primary files:

- `backend/src/bootstrap/http/access-scope.ts`
- `backend/src/bootstrap/http/routers/personnel.router.ts`
- `backend/src/bootstrap/http/routers/students.router.ts`
- `backend/src/modules/students/infrastructure/persistence/prisma/prisma-students.repository.ts`
- `backend/src/modules/practice/infrastructure/persistence/prisma/prisma-practical-lessons.repository.ts`
- `backend/src/modules/exam-applications/infrastructure/persistence/prisma/prisma-exam-applications.repository.ts`

Expected result:

- stable foreign keys such as `tenantMembershipId` and `userId` become the only authority fields for access-sensitive joins and filters;
- names remain display data only.

Acceptance criteria:

- no authorization-sensitive path depends on `displayName`, `assignedInstructorName`, `student.email`, or `parentEmail` for identity matching;
- legacy rows are backfilled or migration-handled before fallback removal;
- instructor rename does not break visibility or counts.

Verification:

- integration tests proving behavior before and after an instructor rename;
- tests for parent and student access based on membership IDs, not email fallback.

### 3. Add integration coverage for sensitive modules, not just personnel

Why:

- the repository now has tests, but coverage is too narrow relative to project risk;
- financial mutations and authorization boundaries must be proven, not assumed.

Primary files:

- `backend/test/integration/personnel.api.test.ts`
- new test files under `backend/test/integration/`

Required new suites:

- `payments.api.test.ts`
- `invoices.api.test.ts`
- `students.api.test.ts`
- `documents.api.test.ts`
- `practice.api.test.ts`

Minimum scenarios per suite:

- happy path for allowed role;
- forbidden path for disallowed role;
- cross-tenant isolation case;
- DB state assertion for every mutation that changes money or identity-related records.

Acceptance criteria:

- payments and invoices have both read and mutation integration tests;
- student create and update flows are covered with authorization checks;
- document and practice endpoints have role-boundary tests;
- tests use real Prisma-backed queries, not mocked repositories.

Verification:

- `backend` test run passes locally;
- `backend` typecheck passes locally.

## P1 - Next Sprint

### 4. Move financial business rules out of routers

Why:

- payment defaults and invoice calculation logic currently live in HTTP handlers;
- this makes behavior harder to reuse, test, and evolve safely.

Primary files:

- `backend/src/bootstrap/http/routers/payments.router.ts`
- `backend/src/bootstrap/http/routers/invoices.router.ts`
- `backend/src/modules/payments/application/services/payments-command.service.ts`
- `backend/src/modules/invoicing/application/services/invoices-command.service.ts`

Rules to move:

- payment number generation;
- default `paidAmount` behavior;
- invoice number generation;
- VAT and subtotal derivation;
- correction-state shaping and date normalization where it represents business behavior.

Acceptance criteria:

- routers only validate transport input, call services, and map responses;
- business rules are unit-testable without HTTP;
- financial calculations live in application or domain code.

Verification:

- new unit tests for payment and invoice command behavior;
- existing and new integration tests still pass.

### 5. Remove direct Prisma access from the personnel router

Why:

- the personnel route bypasses the repository/service pattern used elsewhere;
- that inconsistency will make future authorization and audit changes harder.

Primary files:

- `backend/src/bootstrap/http/routers/personnel.router.ts`
- identity application and persistence files under `backend/src/modules/identity/`

Expected result:

- personnel list, read, role sync support, and deletion checks go through application services and repositories;
- router owns HTTP concerns only.

Acceptance criteria:

- `personnel.router.ts` contains no direct `prismaClient` usage;
- behavior stays unchanged for owner and developer flows;
- delete and update behavior remains audited.

Verification:

- existing personnel integration suite passes unchanged or with stronger assertions.

### 6. Add service-to-service authentication for OCR worker calls

Why:

- OCR worker communication currently trusts the network boundary alone.

Primary files:

- `backend/src/bootstrap/http/ocr.ts`
- `backend/src/config/env.schema.ts`
- OCR worker service files outside this repo area if applicable

Expected result:

- backend sends a shared secret or signed header with OCR requests;
- worker validates the header before processing.

Acceptance criteria:

- missing or invalid service auth is rejected by the worker;
- backend configuration validates the required secret;
- failure mode is observable and explicit.

Verification:

- unit or integration-style tests around request signing/validation where practical;
- manual verification against local OCR worker if available.

## P2 - After The Core Risks

### 7. Normalize repository wiring and reduce manual duplication

Why:

- the service wiring currently creates multiple `PrismaStudentsRepository` instances;
- risk is low, but cleanup will reduce noise and future wiring mistakes.

Primary files:

- `backend/src/bootstrap/http/services.ts`

Acceptance criteria:

- one shared students repository instance is reused across students query, command, and determinator services;
- similar duplication is removed when touched elsewhere.

Verification:

- backend typecheck and tests pass.

### 8. Add structured logging and request correlation

Why:

- the backend currently uses plain console logging;
- production debugging will be harder without structured request context.

Primary files:

- `backend/src/main.ts`
- `backend/src/bootstrap/http/create-http-app.ts`
- middleware/bootstrap files under `backend/src/bootstrap/http/`

Expected result:

- structured logs with request ID, tenant ID, user ID where safe and appropriate;
- easier tracing for auth, OCR, and finance incidents.

Acceptance criteria:

- incoming requests receive correlation IDs;
- auth failures, OCR failures, and finance mutations can be traced through logs;
- no sensitive secrets are emitted.

Verification:

- local startup and request smoke checks;
- documentation updated if logging conventions change.

### 9. Replace realistic personal mock data in frontend demo data

Why:

- frontend mock records currently look too close to real personal data;
- this is avoidable hygiene debt.

Primary files:

- `frontend/src/app/content/mockDb.ts`

Acceptance criteria:

- demo data is obviously synthetic;
- no realistic national IDs or production-looking personal records remain;
- production flows do not depend on the mock source.

Verification:

- frontend typecheck and build pass;
- spot-check rendered screens.

### 10. Revisit cache strategy after scoped query refactor

Why:

- current cache TTL concerns should be evaluated after the authorization/query design is fixed;
- otherwise we risk tuning around the wrong bottleneck.

Primary files:

- `backend/src/bootstrap/http/cache.ts`
- `backend/src/bootstrap/http/access-scope.ts`
- read-heavy router files under `backend/src/bootstrap/http/routers/`

Acceptance criteria:

- cache TTLs are reviewed after scoped-query rollout;
- invalidation behavior is still correct for tenant reads and scoped reads;
- cache settings reflect measured endpoint behavior, not guesses.

Verification:

- lightweight local measurement or profiling notes;
- no stale data regressions in integration tests.

## Suggested Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9
10. Task 10

## Ownership Guidance

- backend authorization and query work: backend engineer
- identity-linking cleanup and migration safety: backend + database
- integration coverage: backend + QA
- OCR trust boundary: backend + devops
- logging and observability: backend + devops
- frontend mock data cleanup: frontend engineer
