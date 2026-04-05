# Testing Knowledge Domain

## Purpose

This folder stores reusable testing strategy, standards, and checklists for backend, frontend, and integration testing in this project and future SaaS projects.

## Key Principles

- Test behavior, not implementation details.
- Prefer integration tests that exercise real DB queries over unit tests that mock everything.
- Keep tests close to the code they cover — same module, same naming convention.
- A test suite that only passes with mocks is less trustworthy than one that passes against a real DB.
- Every authorization boundary, tenant isolation rule, and financial mutation deserves an explicit test.

## Test Pyramid

```
         /\
        /E2E\          — Critical user journeys (few, slow, high-confidence)
       /------\
      / Integ  \       — API endpoints, DB queries, service integrations (most coverage here)
     /----------\
    /    Unit    \     — Pure domain logic, validators, utilities (fast, narrow scope)
   /--------------\
```

## Backend Testing Standards

### What Must Be Tested

- [ ] All authentication flows (login, logout, session expiry, wrong credentials).
- [ ] All authorization boundaries: each role (owner, admin, instructor, student, parent) gets and is denied the right resources.
- [ ] Tenant isolation: user from tenant A cannot access tenant B's data under any endpoint.
- [ ] Financial mutations: payment create/update records correctly and fails on invalid data.
- [ ] Document mutations: create/update with valid and invalid student scope.
- [ ] Schema/migration safety: every migration is reversible or has explicit down notes.
- [ ] Rate limiting behavior on sensitive endpoints.

### Integration Test Pattern

```typescript
// Arrange: create a real test tenant + membership + session
// Act: call the real Express app with supertest
// Assert: check DB state + response body + audit log
```

### Unit Test Pattern (domain logic only)

```typescript
// Pure functions: validators, calculators, formatters
// No DB, no HTTP — just input → output assertions
```

### Test File Location

- `backend/src/modules/<module>/tests/` — module-scoped tests
- `backend/test/` — cross-cutting integration tests

### Verification Commands

```bash
npm run test          # all tests
npm run test:watch    # watch mode
npm run test:coverage # coverage report
npx tsc --noEmit      # type check without building
```

## Frontend Testing Standards

### What Must Be Tested

- [ ] Critical user flows: login, main CRUD pages render without crashing.
- [ ] Form validation: required fields, invalid input states.
- [ ] Role-gated UI: elements visible/hidden per role.
- [ ] Empty/loading/error states for every data-fetching component.
- [ ] Accessibility: keyboard navigation on interactive components.

### Component Test Pattern

```tsx
// Use React Testing Library
// Render the component with realistic props
// Assert visible text, button states, user interactions
// Do not test implementation details (class names, internal state)
```

### Verification Commands

```bash
npm run test          # Vitest component tests
npm run build         # catches TS and import errors
```

## QA Review Checklist (before shipping)

- [ ] All new behavior has at least one test.
- [ ] Happy path tested.
- [ ] Error path tested (invalid input, 4xx responses).
- [ ] Authorization boundary tested (forbidden case).
- [ ] No test relies on hardcoded UUIDs or non-idempotent setup.
- [ ] Tests are independent — can run in any order.
- [ ] No `.only` left in test files.
- [ ] CI passes locally before PR is opened.

## Subagent Pairing

- Use `qa_reviewer` (read-only) to analyze test gaps and produce a verification checklist.
- Use `qa_writer` (write) to author the actual test code for a bounded implementation slice.
- Pair both for a new feature: `qa_reviewer` first (gap analysis), then `qa_writer` (implementation).
