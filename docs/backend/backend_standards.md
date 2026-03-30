# Backend Standards

## 1. Goal

These are the backend implementation rules for this project.

They exist to keep the backend:

- modular;
- secure;
- explicit;
- auditable;
- maintainable.

## 2. Stack Rules

- Runtime: `Node.js`
- Transport layer: `Express`
- Language: `TypeScript`
- Database access: `Prisma`
- Database: `PostgreSQL`
- Background processing: application jobs on top of the modular monolith
- API style: `GraphQL` for read-heavy query use cases, `REST` for commands and uploads

## 3. Architecture Rules

- Keep the system a modular monolith until measured evidence justifies further distribution.
- Split by business modules.
- Keep transport concerns separate from business logic.
- Keep module boundaries explicit.
- Do not introduce abstractions without a real payoff.

## 4. Module Rules

Each module should have clear places for:

- transport or presentation;
- application services and use cases;
- domain rules;
- infrastructure or persistence;
- tests.

Files should be named by use case and behavior, not by generic labels.

## 5. API Rules

- Use REST for commands, uploads, and workflow actions.
- Use GraphQL for read-heavy aggregate screens.
- Validate inputs early.
- Keep handlers thin.
- Return consistent error shapes.
- Make authorization explicit at the boundary.

## 6. Data Rules

- PostgreSQL is the source of truth.
- Model every tenant-owned table with `tenant_id`.
- Use minor units for money.
- Use UTC timestamps.
- Use constraints deliberately.
- Keep file binaries out of the relational database; keep metadata in PostgreSQL.

## 7. Security Rules

- Authorization must be tenant-aware on every sensitive path.
- Never rely only on frontend hiding.
- Log security-sensitive and financial actions.
- Keep secrets backend-only.
- Treat document/OCR/AI workflows as sensitive.

## 8. Operational Rules

- Centralize configuration.
- Centralize error handling.
- Use structured logging.
- Keep health and operational visibility first-class.
- Design jobs and retries to be idempotent.

## 9. Testing Rules

- Test core business rules.
- Test critical finance and permissions logic.
- Test file/document handling flows.
- Test error cases, not only happy paths.

## 10. Definition of Done

A backend feature is not done when the endpoint responds once.

It is done when:

- the business rule is clear;
- validation exists;
- authorization is correct;
- persistence is correct;
- auditability is handled where required;
- important failures are handled;
- the shape is ready for frontend consumption.
