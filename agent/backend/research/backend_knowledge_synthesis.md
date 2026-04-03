# Backend Knowledge Synthesis

## 1. Purpose

This document turns the backend reference set into project-ready engineering knowledge.

It explains:

- what the strongest backend lessons are;
- how they apply to this product;
- what to avoid;
- how to act on them step by step.

## 2. Node.js: Runtime Knowledge

Node.js is the runtime, not the architecture.

Sources:

- [Node.js Learn](https://nodejs.org/en/learn)
- [Node.js API documentation](https://nodejs.org/docs/latest/api/documentation.html)

### Project implications

- runtime APIs should be understood from official docs, not guessed;
- async control flow and error propagation must be deliberate;
- environment handling, process behavior, and file/network I/O are foundational, not incidental.

### Working rule

Whenever a backend decision depends on runtime behavior, prefer the Node.js official docs over blog memory.

## 3. Express: Transport Layer Knowledge

Express is the transport layer choice for this project, not the place where business logic should live.

Sources:

- [Using middleware](https://expressjs.com/en/guide/using-middleware)
- [Writing middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [Routing](https://expressjs.com/en/guide/routing.html)
- [Error handling](https://expressjs.com/en/guide/error-handling.html)

### What the official docs reinforce

- middleware order matters;
- errors must flow through `next(err)` or explicit async handling;
- custom error handlers must respect `res.headersSent`;
- route handlers should stay simple.

### Project implications

- thin route handlers;
- clear middleware for auth, tenant scope, validation, and error handling;
- centralized error translation;
- no domain logic hidden inside Express route files.

## 4. Node Best Practices and Bulletproof Structure

The two strongest non-official backend references here are:

- [nodebestpractices](https://github.com/goldbergyoni/nodebestpractices)
- [bulletproof-nodejs](https://github.com/santiq/bulletproof-nodejs)

### Stable lessons worth keeping

- structure by business components/modules;
- keep transport thin;
- keep configuration centralized;
- centralize error handling;
- separate bootstrapping from business modules;
- make the project understandable for a new developer quickly.

### What not to copy blindly

- exact package choices from old examples;
- architecture layers that do not earn their cost;
- abstractions added only because a guide had them.

## 5. Backend Architecture for This Project

The correct model remains:

- `Node.js + Express + TypeScript`
- modular monolith
- PostgreSQL as source of truth
- Prisma as ORM/data access layer
- background jobs for automation
- GraphQL for read-heavy query surfaces
- REST for commands, uploads, and workflow actions

### Why this is correct

This product needs:

- strong consistency;
- tenant isolation;
- financial correctness;
- document safety;
- operational simplicity.

That makes a modular monolith the right default.

## 6. Prisma Knowledge

Prisma is not just a query tool.  
It is part of the data-modeling workflow.

Sources:

- [Prisma docs home](https://docs.prisma.io/)
- [Prisma relations](https://docs.prisma.io/docs/v6/orm/prisma-schema/data-model/relations)
- [One-to-one relations](https://docs.prisma.io/docs/v6/orm/prisma-schema/data-model/relations/one-to-one-relations)
- [One-to-many relations](https://docs.prisma.io/docs/v6/orm/prisma-schema/data-model/relations/one-to-many-relations)

### What to apply

- model relations deliberately;
- reflect business ownership explicitly;
- avoid vague relation naming;
- make nullable vs required relations intentional;
- keep schema understandable to humans.

### Project-critical Prisma concerns

- tenant ownership fields;
- role and permission modeling;
- student-payment-invoice-document relations;
- instructor-vehicle-lesson relations;
- audit and automation-related records;
- OCR and AI metadata tables.

## 7. PostgreSQL Knowledge

PostgreSQL is the source of truth, so database design is a correctness problem first and a performance problem second.

Sources:

- [PostgreSQL docs](https://www.postgresql.org/docs/)
- [Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Indexes](https://www.postgresql.org/docs/current/indexes.html)

### What to apply

- use constraints to enforce business correctness;
- use composite and tenant-first indexes based on real access patterns;
- use foreign keys where the relationship must exist;
- model money safely;
- use timestamps consistently.

### Project-specific rules

- `tenant_id` on tenant-owned tables;
- money in integer minor units;
- document binaries outside the relational DB;
- metadata and business records inside PostgreSQL;
- auditability planned from the start.

## 8. API Style Knowledge

This project intentionally uses two API styles for different jobs.

### GraphQL for reads

Source:

- [GraphQL.org](https://graphql.org/)

Use GraphQL where the frontend needs:

- aggregate screens;
- variable field selection;
- rich read models;
- dashboard-like data compositions.

### REST for commands and uploads

Use REST where the system needs:

- explicit command actions;
- file uploads;
- webhook handling;
- operational endpoints;
- simple workflow transitions.

### Practical consequence

Do not force one style onto everything.

## 9. Security Knowledge

Security is not a separate project phase.

Sources:

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

### What to apply

- treat auth and authorization separately;
- authorize every sensitive action explicitly;
- log important actions;
- treat uploads as hostile until validated;
- protect financial and document flows with stronger review and audit.

### Project-critical security zones

- documents and OCR;
- payments and invoices;
- platform-admin feature flags;
- AI data access;
- tenant boundaries.

## 10. DevOps Knowledge

Backend quality is inseparable from operational quality.

Source base:

- `The DevOps Handbook`
- internal notes in [agent/architecture/research/devops_research.md](../../architecture/research/devops_research.md)

### What to apply

- repeatable deployments;
- environment separation;
- observability;
- backup and restore discipline;
- incident readiness;
- simple operations over fragile cleverness.

### Project implication

The backend should always be built with:

- deployment in mind;
- backup in mind;
- audit in mind;
- supportability in mind.

## 11. Delivery Order

The best backend teams do not start by building dozens of routes.

They work like this:

1. confirm business rule;
2. confirm contract;
3. confirm schema impact;
4. build foundation;
5. build one working vertical slice;
6. add automation only when data is trustworthy;
7. add integrations after internal flows are stable.

This exactly matches the project playbook and should remain the rule.

## 12. First-Class Backend Quality Signals

For this project, backend quality means:

- modules are understandable;
- auth is explicit;
- tenant scope is explicit;
- errors are handled consistently;
- data integrity is enforced;
- financial behavior is safe;
- document behavior is auditable;
- automation is idempotent;
- the system is operationally supportable.

## 13. Final Working Rules

When implementing backend work:

1. prefer official docs first;
2. use nodebestpractices and bulletproof-nodejs for engineering judgment;
3. use the project architecture docs as the business boundary;
4. build modules, not endpoint piles;
5. favor correctness and clarity over speed theater.
