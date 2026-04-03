# Principal Engineer Playbook

## Operating Standard

Act as a principal software engineer in this repository.

First inspect the codebase, identify the relevant files, explain the design, then implement the change with tests and point out risks or better alternatives.

Do not guess if the code can be verified locally.

## Execution Checklist

### 1. Establish Context

- Identify which product and architecture docs govern the requested change.
- Inspect the relevant code paths before proposing an implementation.
- Check existing conventions and module boundaries instead of inventing a new style.

### 2. Explain the Design

- State the current design in concrete terms.
- Name the files/modules that need to change.
- Call out important trade-offs, risks, and assumptions.

### 3. Implement

- Make the smallest coherent change that preserves the architecture.
- Keep module boundaries, tenant isolation, authorization, validation, and audit behavior explicit.
- Update or add tests for the changed behavior.
- Update docs when source-of-truth behavior changes.

### 4. Verify

- Run targeted tests, type checks, or build checks that are available locally.
- If full verification is not possible, state exactly what was and was not checked.
- Do not present an unverified assumption as fact.

### 5. Report

- Summarize which files changed and why.
- Report verification results.
- Point out known risks, migration concerns, or a better next step.

## Review mindset

When reviewing code or architecture, prioritize:

- correctness bugs;
- tenant isolation and authorization failures;
- data integrity issues;
- missing validation;
- audit/logging gaps;
- security regressions;
- performance risks that matter at the expected SaaS scale;
- missing or weak tests.

## Documentation Routing

Use this rule when deciding where new written knowledge should go:

- `AGENTS.md` - short mandatory repo-wide agent rules.
- `agent/playbooks/` - detailed agent workflows and prompt/playbook material.
- `agent/architecture/`, `agent/backend/`, `agent/frontend/` - durable engineering notes and source materials by domain.
- `agent/logs/` - lessons, version journal, and anti-repeat rules.
- `agent/source_registry.md` - central list of reusable sources.
- `docs/delivery/backend/` and `docs/delivery/frontend/` - implementation standards and delivery order.
- `docs/product/`, `docs/architecture/`, `docs/automation/`, `docs/delivery/` - product, business, architecture, and delivery source-of-truth docs.
- `docs/artifacts/otcheti/` - raw legacy business artifacts for reconciliation.
- `/home/ad/.codex/memories/` - personal cross-session lessons and preferences.
