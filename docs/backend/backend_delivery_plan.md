# Backend Delivery Plan

## 1. Goal

This document explains the correct build order for the backend.

The backend should not be built as a random collection of endpoints.

It should be built in layers and vertical slices.

## 2. Correct Order

### Step 1: Stabilize the boundaries

Before building many routes:

- confirm product rules;
- confirm role and permission model;
- confirm module boundaries;
- confirm the frontend contracts for the first modules.

### Step 2: Finalize core data modeling

Focus first on:

- tenants;
- users and roles;
- students;
- payments;
- invoices;
- documents;
- theory attendance;
- practical lessons.

### Step 3: Build backend foundation

Create and stabilize:

- app bootstrap;
- config loading;
- logger;
- error handling;
- auth skeleton;
- authorization policy structure;
- Prisma client integration;
- storage abstraction;
- audit logging basics.

### Step 4: Build vertical slices

Recommended order:

1. identity
2. tenancy
3. platform-admin
4. students
5. payments
6. invoicing
7. documents
8. theory
9. practice
10. instructors
11. vehicles
12. notifications
13. reporting
14. AI

For each slice:

- schema support;
- create/edit/detail/list behavior;
- validation;
- authorization;
- audit where needed;
- frontend contract support.

### Step 5: Add jobs and automation

Only after the data model and core flows are trustworthy:

- reminders;
- expiry checks;
- risk scoring;
- OCR processing;
- reporting jobs;
- owner/admin summaries.

### Step 6: Add external integrations

Last, and only with controlled boundaries:

- NRA/NAP-related adapters;
- IAAA/DAI support flows;
- notification providers;
- storage providers;
- accounting integrations.

## 3. Per-Feature Backend Checklist

For each backend feature:

1. confirm the product rule;
2. confirm the contract;
3. confirm the data model impact;
4. implement validation;
5. implement authorization;
6. implement persistence;
7. implement the response shape;
8. implement auditability if needed;
9. implement tests for key logic.

## 4. Main Anti-Patterns

Do not:

- build handlers first and invent the model later;
- mix transport logic with domain logic;
- skip auditability on sensitive flows;
- over-generalize too early;
- add integrations before internal workflows are stable.
