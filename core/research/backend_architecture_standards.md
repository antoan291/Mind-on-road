# Backend Architecture Standards

## Goal

Този документ събира на едно място backend стандартите за архитектура, код, база данни, сигурност и operational discipline.
Той трябва да служи като source of truth за това как се пише и поддържа backend код в този проект и в следващи сходни SaaS проекти.

## Core source set

- Clean Code
- goldbergyoni/nodebestpractices
- Designing Data-Intensive Applications
- System Design Interview
- The DevOps Handbook
- PostgreSQL official documentation
- Prisma documentation
- Existing project docs for security, backup, architecture and multi-tenancy

## Architecture rules

- Prefer a modular monolith until there is measured evidence that stronger distribution is needed.
- Split the backend by business modules, not by generic technical layers only.
- Keep module boundaries explicit and stable.
- Keep controllers or transport handlers thin and move business rules into application and domain services.
- Make multi-tenant boundaries explicit in both code and data access.
- Do not add abstractions without a clear operational or maintenance benefit.

## Code quality rules

- Favor clear names over short clever names.
- Keep functions small and focused on one responsibility.
- Avoid giant files; split by feature and by responsibility.
- Centralize shared rules and utilities instead of duplicating logic.
- Prefer explicit flow over hidden magic.
- Comments should explain why, not restate obvious code.
- Refactor structure before complexity becomes normal.

## Error handling and observability rules

- Distinguish operational errors from programmer errors.
- Handle expected operational failures centrally and consistently.
- Log important events with structured logging.
- Keep audit trails for sensitive actions.
- Surface failures in a way that supports monitoring and incident response.
- Do not swallow promise failures or background job errors silently.

## Database rules

- PostgreSQL is the source of truth for business data.
- Use tenant-first modeling and tenant-first indexing.
- Use integer minor units for money.
- Use UTC timestamps with timestamptz.
- Use constraints deliberately: foreign keys, unique constraints, check constraints and transactional integrity.
- Keep document metadata in the database and binaries in object storage.
- Design every important table with later auditing, restore and reporting in mind.

## Security rules

- Authorization must be tenant-aware on every sensitive path.
- Sensitive modules must never rely on frontend hiding alone.
- Use audit logs for permission changes, financial actions, document access and platform-admin changes.
- Keep secrets, storage access and AI credentials backend-only.
- Treat document handling, OCR and AI-assisted actions as high-sensitivity flows.
- Prefer deny-by-default when access is unclear.

## DevOps and delivery rules

- Deployment must be repeatable and environment-aware.
- Backup strategy, restore drills and recovery objectives are part of the architecture.
- Infrastructure decisions must be documented and operationally understandable.
- Monitoring, alerting and incident runbooks are backend responsibilities too.
- Prefer simple delivery flows that the team can actually operate safely.

## How to use this file

Use this document as the top backend reference before creating modules, database schemas, APIs, background jobs, AI integrations, security-sensitive flows or operational tooling.
If a new source changes one of these rules, update this file and log the change in core/logs/version_journal.md.

## Current backend runtime choice

- The backend runtime for this project is `Node.js + Express + TypeScript`.
- Express is the transport layer choice; the modular monolith structure and business layering stay framework-agnostic above it.

## Additional backend structure reference

- Bulletproof Node.js architecture can be used as a structure reference for layering, validation placement and startup organization, but its package choices and older stack assumptions must be filtered through our current architecture.
