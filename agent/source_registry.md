# Source Registry

## GitHub Profiles And Repositories

- Dan Abramov / gaearon — https://github.com/gaearon?tab=repositories
- Theo Browne / t3dotgg — https://github.com/t3dotgg?tab=repositories
- Node.js Best Practices repo — https://github.com/goldbergyoni/nodebestpractices
- Bulletproof Node.js architecture repo — https://github.com/santiq/bulletproof-nodejs
- Clean Code PDF reference — https://github.com/jnguyen095/clean-code/blob/master/Clean.Code.A.Handbook.of.Agile.Software.Craftsmanship.pdf
- BibliotecaDev LivrosDev catalog with DevOps/AWS books — https://github.com/KAYOKG/BibliotecaDev/tree/main/LivrosDev

## Local Books And Materials

- agent/backend/materials/books/nodejs-manual.pdf
- agent/backend/materials/books/node-v16-docs.pdf
- agent/architecture/materials/books/designing-data-intensive-applications.pdf
- agent/architecture/materials/books/system-design-interview.pdf
- agent/architecture/materials/books/The DevOps Handbook-[Gene Kim].pdf

## Local Synthesized Notes

- agent/architecture/research/database_research.md
- agent/architecture/research/devops_research.md
- agent/devops/README.md
- agent/devops/research/aws_deployment_standards.md
- agent/database/research/postgres_prisma_migration_standards.md
- agent/product/research/product_requirements_playbook.md
- agent/qa/research/testing_strategy.md
- agent/ux/research/b2b_admin_ux_review_standards.md
- agent/backend/research/backend_architecture_standards.md
- agent/backend/research/backend_reference_library.md
- agent/backend/research/backend_knowledge_synthesis.md
- agent/backend/research/bulletproof_nodejs_notes.md
- agent/backend/research/nodejs_best_practices.md
- agent/frontend/research/frontend_reference_library.md
- agent/frontend/research/frontend_knowledge_synthesis.md

## Official Documentation And Research Anchors

- PostgreSQL CREATE POLICY (RLS): https://www.postgresql.org/docs/current/sql-createpolicy.html
- PostgreSQL PITR and continuous archiving: https://www.postgresql.org/docs/current/continuous-archiving.html
- Prisma Postgres docs: https://docs.prisma.io/docs/v6/postgres
- React official docs: https://react.dev/learn
- GitHub flow: https://docs.github.com/get-started/using-github/github-flow

## Fixed Project Reminders

- Product type: multi-tenant SaaS for driving schools
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Infra: Redis + Nginx + Hetzner
- API style: REST throughout (GET for queries, POST/PUT/DELETE for commands and uploads)
- AI rule: tenant-scoped only
- Security, backups, and auditability are mandatory system properties

## Usage Rule

When a source materially changes architecture, database design, frontend structure, security, or operational rules, summarize it in the relevant `agent/*/research/` folder or in `docs/`, and log the decision in `agent/logs/version_journal.md`.
