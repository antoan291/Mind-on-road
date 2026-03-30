# Backend Reference Library

## 1. Goal

This file collects the strongest backend sources for this project.

The priority is:

- official documentation first;
- proven engineering references second;
- internal project standards third.

## 2. Core Official Docs

### Node.js

- [Node.js Learn](https://nodejs.org/en/learn)
- [Node.js API documentation](https://nodejs.org/docs/latest/api/documentation.html)

Why it matters:

- Node.js is the runtime of the backend;
- the API docs are the source of truth for runtime behavior, modules, and core APIs.

### Express

- [Using middleware](https://expressjs.com/en/guide/using-middleware)
- [Writing middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [Routing](https://expressjs.com/en/guide/routing.html)
- [Error handling](https://expressjs.com/en/guide/error-handling.html)

Why it matters:

- Express is the transport layer of the backend;
- middleware and error handling discipline are core to correctness.

### Prisma

- [Prisma docs home](https://docs.prisma.io/)
- [Prisma ORM overview](https://docs.prisma.io/docs/orm)
- [What is Prisma ORM?](https://docs.prisma.io/docs/v6/orm/overview/introduction/what-is-prisma)
- [Getting started with Prisma ORM](https://www.prisma.io/docs/v6/orm/getting-started)

Why it matters:

- Prisma is the actual database access layer in this project;
- schema, migrations, and client usage must be learned from primary sources.

### PostgreSQL

- [PostgreSQL docs](https://www.postgresql.org/docs/)
- [PostgreSQL tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Indexes](https://www.postgresql.org/docs/current/indexes.html)

Why it matters:

- PostgreSQL is the source of truth for business data;
- constraints and indexing strategy directly affect correctness and performance.

### GraphQL

- [GraphQL.org](https://graphql.org/)
- [GraphQL resource hub](https://graphql.org/resources/)

Why it matters:

- GraphQL is part of the read/query strategy of the product.

## 3. Security Sources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

Why these matter:

- this product handles personal data, money, documents, and uploads;
- secure defaults must be designed, not added as an afterthought.

## 4. Project-Specific Human References

These are high-value engineering references and should be treated as permanent sources:

- [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices)
- [santiq/bulletproof-nodejs](https://github.com/santiq/bulletproof-nodejs)

Use them for:

- structure judgment;
- delivery discipline;
- practical Node.js backend instincts.

Do not copy them blindly.  
Filter them through this project's actual architecture.

## 5. Books and Internal Sources

- [core/source_registry.md](/C:/AD/work/My%20company/school/core/source_registry.md)
- [core/research/backend_architecture_standards.md](/C:/AD/work/My%20company/school/core/research/backend_architecture_standards.md)
- [core/research/nodejs_best_practices.md](/C:/AD/work/My%20company/school/core/research/nodejs_best_practices.md)
- [core/research/bulletproof_nodejs_notes.md](/C:/AD/work/My%20company/school/core/research/bulletproof_nodejs_notes.md)
- [core/research/database_research.md](/C:/AD/work/My%20company/school/core/research/database_research.md)
- [core/research/devops_research.md](/C:/AD/work/My%20company/school/core/research/devops_research.md)

Core books behind these notes include:

- `Clean Code`
- `The DevOps Handbook`
- `Building Microservices`
- `Designing Data-Intensive Applications`

## 6. How to Use This Library

When implementing backend work:

1. use the project docs to understand the business;
2. use this reference library to choose the right technical source;
3. prefer official docs first;
4. use the GitHub references and books for architecture judgment, not for blind copying.
