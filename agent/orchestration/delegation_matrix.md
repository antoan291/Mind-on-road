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
| `product_analyst` | read-only | workflow decomposition, requirements, acceptance criteria, business-rule ambiguity | implementation ownership or speculative roadmap writing |
| `qa_reviewer` | read-only | missing tests, edge cases, verification plan | large refactors or implementation ownership |
| `repo_explorer` | read-only | mapping code paths, identifying files, explaining current design | editing files or speculative rewrites |
| `security_reviewer` | read-only | auth, authorization, tenant isolation, sensitive-data risk | non-security style feedback |
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
