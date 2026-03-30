# Source Registry

## GitHub profiles and repositories

- Dan Abramov / gaearon — https://github.com/gaearon?tab=repositories
- Theo Browne / t3dotgg — https://github.com/t3dotgg?tab=repositories
- Node.js Best Practices repo — https://github.com/goldbergyoni/nodebestpractices
- Bulletproof Node.js architecture repo — https://github.com/santiq/bulletproof-nodejs
- Clean Code PDF reference — https://github.com/jnguyen095/clean-code/blob/master/Clean.Code.A.Handbook.of.Agile.Software.Craftsmanship.pdf

## Local books and materials

- core/materials/books/all.pdf
- core/materials/books/node-v16-docs.pdf
- core/materials/books/designing-data-intensive-applications.pdf
- core/materials/books/system-design-interview.pdf
- core/materials/books/The DevOps Handbook-[Gene Kim].pdf
- core/materials/references/joga-recommended-technologies.docx
- core/materials/references/joga-database-schema.docx

## Official documentation and research anchors

- PostgreSQL CREATE POLICY (RLS): https://www.postgresql.org/docs/current/sql-createpolicy.html
- PostgreSQL PITR and continuous archiving: https://www.postgresql.org/docs/current/continuous-archiving.html
- Prisma Postgres docs: https://docs.prisma.io/docs/v6/postgres
- React official docs: https://react.dev/learn
- GitHub flow: https://docs.github.com/get-started/using-github/github-flow

## Fixed project reminders

- Product type: multi-tenant SaaS for driving schools
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Infra: Redis + Nginx + Hetzner
- API style: GraphQL for reads, REST for commands and uploads
- AI rule: tenant-scoped only
- Security, backups, and auditability are mandatory system properties

## Usage rule

When a source materially changes architecture, database design, frontend structure, security, or operating rules, summarize it in core/research or docs and log the decision in core/logs/version_journal.md.
