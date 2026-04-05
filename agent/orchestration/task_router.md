# Automatic Task Router

## Purpose

This file defines how the parent agent should automatically select the right skill, knowledge folder, and optional subagents for each task type.

Use this router for every non-trivial request before implementation.

## Hard Rule

Automatically route skills, playbooks, and domain knowledge for every non-trivial task.

Spawn subagents only when the user explicitly asks for subagents, delegation, or parallel agents, or uses a standing phrase such as:

```text
Use automatic orchestration with subagents if useful.
```

## Routing Table

| Task Type | Load Skill | Read Knowledge | Optional Subagents If Delegation Is Allowed |
|---|---|---|---|
| New backend feature | `implementation-slice`, `repo-onboarding` | `agent/backend/README.md`, `agent/architecture/README.md`, relevant `docs/*` | `repo_explorer`, `architect_reviewer`, `backend_engineer`, `qa_reviewer`, `security_reviewer` if auth/data-sensitive |
| New frontend feature | `implementation-slice`, `repo-onboarding` | `agent/frontend/README.md`, relevant `docs/*` | `repo_explorer`, `frontend_engineer`, `qa_reviewer`, `architect_reviewer` if shared-state or routing design changes |
| Full-stack feature | `implementation-slice`, `repo-onboarding`, `product-discovery` if scope is fuzzy, `ux-review` if UI-heavy | `agent/backend/README.md`, `agent/frontend/README.md`, `agent/product/README.md`, `agent/ux/README.md`, `agent/architecture/README.md`, relevant `docs/*` | `product_analyst`, `repo_explorer`, `backend_engineer`, `frontend_engineer`, `database_migration_engineer` if schema changes, `ux_product_reviewer`, `architect_reviewer`, `qa_reviewer`, `security_reviewer` |
| Bug fix | `repo-onboarding`, `implementation-slice`, `review-sweep` for regression-sensitive fixes | domain folder matching bug area + `agent/qa/README.md` + relevant docs | `repo_explorer`, `qa_reviewer`, `security_reviewer` if auth/tenant/money/docs/AI related, `database_migration_engineer` if data/migration risk exists |
| Code review / PR review | `review-sweep`, `repo-onboarding`, `ux-review` if UI touched | all impacted domain folders + relevant docs | `repo_explorer`, `architect_reviewer`, `security_reviewer`, `qa_reviewer`, `ux_product_reviewer` if frontend touched, `database_migration_engineer` if schema touched |
| Architecture/design decision | `repo-onboarding` | `agent/architecture/README.md`, impacted domain docs, relevant product docs | `architect_reviewer`, `repo_explorer`, `docs_researcher` |
| Product/business discovery | `product-discovery`, `repo-onboarding` | `agent/product/README.md`, relevant `docs/product/*`, impacted architecture docs | `product_analyst`, `repo_explorer`, `ux_product_reviewer` if workflow/UI-heavy |
| Security-sensitive change | `implementation-slice`, `review-sweep` | `agent/security/README.md`, `agent/backend/README.md`, `agent/database/README.md`, `agent/architecture/README.md`, `docs/architecture/security_architecture.md` | `security_reviewer`, `architect_reviewer`, `repo_explorer`, `qa_reviewer`, `database_migration_engineer` if schema/data involved |
| Database/schema/migration change | `database-migration`, `repo-onboarding`, `implementation-slice` if code patch needed | `agent/database/README.md`, `agent/architecture/README.md`, `agent/backend/README.md`, relevant docs/schema files | `database_migration_engineer`, `architect_reviewer`, `repo_explorer`, `qa_reviewer`, `security_reviewer` if tenant/data-sensitive |
| Testing/verification | `review-sweep` | `agent/qa/README.md`, impacted domain folder | `qa_reviewer`, `repo_explorer` |
| UX/product UI review | `ux-review`, `repo-onboarding` | `agent/ux/README.md`, `agent/frontend/README.md`, relevant `docs/product/*` | `ux_product_reviewer`, `frontend_engineer` if implementation is needed, `qa_reviewer` |
| Framework/API uncertainty | `repo-onboarding` | impacted domain folder + official docs | `docs_researcher` |
| Architecture decision record | `architecture-decision-record`, `repo-onboarding` | `agent/architecture/README.md`, `agent/architecture/adrs/README.md`, relevant domain docs | `architect_reviewer`, `docs_researcher`, `repo_explorer`, `database_migration_engineer` if schema-heavy |
| Documentation restructuring | `repo-onboarding`, `review-sweep` | `docs/README.md`, `agent/README.md`, impacted domain folder | `repo_explorer`, `docs_researcher`, `architect_reviewer`, `product_analyst` if docs/product scope changes |
| DevOps/deployment/backup | `repo-onboarding`, `implementation-slice`, `devops-aws-deployment` | `agent/devops/README.md`, `agent/devops/research/aws_deployment_standards.md`, `agent/architecture/README.md`, `agent/architecture/research/devops_research.md`, relevant docs | `devops_aws_engineer`, `architect_reviewer`, `security_reviewer`, `qa_reviewer`, `docs_researcher` |
| Sprint planning / work breakdown | `sprint-planning` | `agent/product/README.md`, `docs/product/*`, `agent/architecture/README.md`, relevant delivery docs | `tech_lead`, `product_analyst`, `architect_reviewer` |
| Tech-debt triage | `sprint-planning` | `agent/architecture/README.md`, `agent/backend/README.md`, `agent/frontend/README.md`, relevant docs | `tech_lead`, `architect_reviewer`, `security_reviewer`, `performance_engineer` |
| Performance investigation | `repo-onboarding`, `review-sweep` | `agent/architecture/README.md`, `agent/database/README.md`, `agent/backend/README.md`, `agent/frontend/README.md` | `performance_engineer`, `architect_reviewer`, `database_migration_engineer` if query/index work needed, `backend_engineer` if API path optimization needed |
| Incident response / hotfix | `repo-onboarding`, `implementation-slice`, `review-sweep` | `agent/security/README.md`, domain folder matching incident area, `agent/qa/README.md` | `repo_explorer`, `security_reviewer` if auth/data involved, `qa_reviewer`, `database_migration_engineer` if data corruption risk |
| Writing tests | `repo-onboarding` | `agent/testing/README.md`, domain folder matching test area, relevant docs | `qa_reviewer` (gap analysis first), `qa_writer` (write tests), `repo_explorer` |

## Role Selection Rules

- Use `repo_explorer` when you need fast read-only code mapping or side-effect discovery.
- Use `backend_engineer` for bounded backend patches with tests and disjoint file ownership.
- Use `database_migration_engineer` for Prisma/PostgreSQL schema changes, migration safety, tenant scoping, constraints, and indexes.
- Use `devops_aws_engineer` for deployment, AWS, Docker, CI/CD, observability, backup/restore, and infra trade-off tasks.
- Use `frontend_engineer` for bounded frontend patches with tests and disjoint file ownership.
- Use `product_analyst` for workflow decomposition, acceptance criteria, business-rule ambiguity, and scope boundaries.
- Use `architect_reviewer` when module boundaries, tenant design, migrations, or scalability trade-offs matter.
- Use `security_reviewer` when auth, authorization, tenant scope, secrets, document access, money, or AI/OCR data handling is involved.
- Use `qa_reviewer` when you need missing-test analysis or a focused verification plan.
- Use `ux_product_reviewer` when admin UX, form usability, flow consistency, accessibility, or frontend state coverage matters.
- Use `docs_researcher` when official API/framework behavior must be verified from docs.
- Use `tech_lead` for sprint planning, work breakdown, tech-debt triage, cross-cutting engineering decisions, and scope risk review.
- Use `qa_writer` when test code must be authored (not just reviewed) for a bounded implementation slice.
- Use `performance_engineer` when N+1 queries, missing indexes, slow API paths, large bundles, or memory issues are suspected.

## Parent-Agent Execution Rules

- Do not hand off the immediate blocking step; do it locally.
- Spawn only sidecar tasks that can run independently and return concise output.
- Give each subagent a self-contained task prompt with file paths, constraints, expected output, and ownership boundaries.
- Do not duplicate the same task between parent agent and subagents.
- After subagents return, deduplicate, resolve conflicts, implement/refine locally, and run final verification.
