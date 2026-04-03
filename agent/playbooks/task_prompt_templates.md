# Task Prompt Templates

## Purpose

Reusable prompt templates for driving the parent agent and optional subagents with precise scope, constraints, and output expectations.

## Feature Implementation

```text
Implement [feature/fix] in this repository.

Scope:
- [module/page/service/schema]
- Do not change [out of scope files/behavior]

Requirements:
- [business rules]
- [roles/permissions]
- [edge cases]
- [UI/API/data constraints]

Execution:
- First inspect docs and code, identify relevant files, explain the current design.
- Then implement the smallest coherent change with tests.
- Run local verification if available.
- Report changed files, verification results, risks, and better alternatives.

Use automatic orchestration with subagents if useful.
```

## Code Review

```text
Review [branch/PR/files] with a principal engineer mindset.

Focus on:
- correctness and regressions
- tenant isolation / authorization
- data integrity / migrations
- missing tests
- security and operational risks
- UX consistency if frontend is touched

Return findings first, ordered by severity, with file references and concrete remediation.

Use automatic orchestration with subagents if useful.
```

## Architecture Decision

```text
Analyze [architecture decision] and propose the safest implementation path.

Consider:
- product/business constraints
- module boundaries
- tenant/data model implications
- deployment and rollback
- security and testability

Compare viable options, recommend one, and create/update an ADR if the decision is material.

Use automatic orchestration with subagents if useful.
```

## DevOps/AWS

```text
Design or review the deployment/AWS approach for [service/environment].

Constraints:
- [budget]
- [availability / RPO / RTO]
- [security/compliance]
- [team operational simplicity]

Inspect current Docker/infra/docs files first, then propose the simplest production-safe plan with rollback, monitoring, and verification steps.

Use automatic orchestration with subagents if useful.
```
