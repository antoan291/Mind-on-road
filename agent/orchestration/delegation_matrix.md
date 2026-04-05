# Delegation Matrix

## Subagent Catalog

| Agent | Mode | Best For | Avoid |
|---|---|---|---|
| `architect_reviewer` | read-only | module boundaries, tenant/data architecture, trade-offs | line-by-line style review |
| `backend_engineer` | write | bounded backend implementation and tests | frontend changes, broad architecture review |
| `database_migration_engineer` | write/review | Prisma/PostgreSQL schema, indexes, constraints, tenant scoping, migration rollout safety | UI-only changes or unrelated service-layer refactors |
| `devops_aws_engineer` | write/review | deployment, AWS, CI/CD, Docker, observability, backup/restore | UI-only changes or pure domain-level backend refactors with no infra effect |
| `docs_researcher` | read-only | verifying framework/API behavior from official docs | code edits or unsourced claims |
| `frontend_engineer` | write | bounded frontend implementation and UI tests | backend schema/service changes |
| `performance_engineer` | read-only | N+1 queries, missing indexes, slow API paths, large frontend bundles, memory leaks | style review, unrelated feature work |
| `product_analyst` | read-only | workflow decomposition, requirements, acceptance criteria, business-rule ambiguity | implementation ownership or speculative roadmap writing |
| `qa_reviewer` | read-only | missing tests, edge cases, verification plan | large refactors or implementation ownership |
| `qa_writer` | write | authoring unit/integration/E2E tests for a bounded implementation slice | reviewing without writing, broad refactors |
| `repo_explorer` | read-only | mapping code paths, identifying files, explaining current design | editing files or speculative rewrites |
| `security_reviewer` | read-only | auth, authorization, tenant isolation, sensitive-data risk | non-security style feedback |
| `tech_lead` | read-only | sprint planning, tech-debt triage, work breakdown, cross-cutting engineering decisions | line-level implementation or pure UI/UX feedback |
| `ux_product_reviewer` | read-only | admin UX consistency, form usability, accessibility, empty/error/loading states | pure visual preference feedback |

## Default Fan-Out Patterns

### New Feature

- Parent agent: inspect docs, choose the plan, keep critical-path edits local.
- `product_analyst`: turn the request into workflows, acceptance criteria, edge cases, and scope boundaries if requirements are not fully explicit.
- `repo_explorer`: map current code paths and module ownership.
- `architect_reviewer`: sanity-check the design before large structural changes.
- `database_migration_engineer`: review schema/index/migration risk when data model changes.
- `backend_engineer` + `frontend_engineer`: implement disjoint slices only if file ownership can be separated.
- `ux_product_reviewer`: review interaction consistency and admin workflow quality when frontend flows change.
- `qa_reviewer`: check for missing tests and suggest focused verification commands.

### Bug Fix

- Parent agent: reproduce, localize, and patch the immediate issue.
- `repo_explorer`: trace adjacent code and likely side effects in parallel.
- `qa_reviewer`: identify regression test gaps.
- `security_reviewer`: only if the bug touches auth, tenant scope, documents, money, or AI data.

### Code Review

- `repo_explorer`: summarize changed areas and execution paths.
- `architect_reviewer`: check design regressions.
- `security_reviewer`: check exploitability and tenant leaks.
- `qa_reviewer`: check missing coverage and brittle tests.
- Parent agent: deduplicate findings and return one ordered list.

### Docs/API Uncertainty

- Parent agent: continue local code inspection.
- `docs_researcher`: verify API/framework behavior from official docs and return concise source-backed guidance.

### DevOps/AWS Change

- Parent agent: inspect current deployment/docs files and keep the critical-path decision local.
- `devops_aws_engineer`: propose a deployment/AWS plan, review operational risks, backup/rollback, observability, and cost trade-offs.
- `security_reviewer`: include if IAM/secrets/network exposure/sensitive data risk exists.
- `docs_researcher`: include when official AWS or platform docs need verification.

### Product/UX Discovery

- Parent agent: inspect product docs and code, identify the implementation boundary, and keep decisions explicit.
- `product_analyst`: decompose workflows, business rules, edge cases, and acceptance criteria.
- `ux_product_reviewer`: review usability, state coverage, action hierarchy, and consistency for frontend-facing flows.

## Output Contract For Delegated Tasks

Each delegated task should request:

- inspected or changed files;
- concrete findings or patch summary;
- performed or recommended verification;
- risks, assumptions, and unresolved blockers.

## Conflict Resolution Protocol

When two subagents return contradictory findings or patches, resolve in this order:

1. **Security over features** — a `security_reviewer` finding always takes precedence over a `backend_engineer` or `frontend_engineer` patch that contradicts it.
2. **Architecture over implementation** — an `architect_reviewer` structural objection must be resolved before the implementation patch is merged.
3. **Data integrity over speed** — a `database_migration_engineer` migration-safety concern overrides a faster implementation that skips the safe migration path.
4. **Explicit parent-agent decision** — if two agents disagree on a design choice with no safety/correctness winner, the parent agent makes the call and records the decision in `agent/logs/version_journal.md`.
5. **No silent discard** — if a subagent finding is overruled, the reason must be stated in the parent agent's final report. Never silently drop a security or correctness finding.

## Sprint Planning Fan-Out Pattern

- Parent agent: define the sprint goal and load relevant product docs.
- `tech_lead`: break goal into tasks with effort estimates, dependency order, and risk flags.
- `product_analyst`: clarify acceptance criteria, edge cases, and scope boundaries for each task.
- `architect_reviewer`: flag cross-cutting concerns, module boundary risks, and migration needs.
- Parent agent: produce final ordered task list with assigned roles and verification criteria.
