# Testing Strategy

## Goal

Define a reusable testing strategy for feature implementation and review in this repository.

## Test Pyramid For This Project

- Domain/service tests for core business rules and validation.
- Integration tests for API + persistence + authorization boundaries.
- Component tests for critical UI interactions and state transitions.
- End-to-end tests only for the most valuable user journeys and regression-prone flows.

## What Must Be Tested

- Tenant isolation and role authorization.
- Money, invoices, payments, and status transitions.
- Document upload/review/OCR and sensitive-data handling.
- Form validation and error states.
- Empty/loading/error states for critical screens.
- Migration-sensitive schema/data changes.
- Background jobs and idempotency for automation flows.

## Verification Discipline

- Run the smallest targeted test that proves the changed behavior.
- Then run the relevant broader typecheck/build/test command for the touched package.
- Do not claim confidence from a passing happy-path test if permission, invalid-input, or edge-case paths were not exercised.
- If a check cannot run locally, report exactly why and what remains unverified.

## Regression Test Rule

Every production bug fix should add or update at least one test that would have caught the regression unless that is technically impossible in the current stack. If impossible, document the reason and add a manual verification checklist.
