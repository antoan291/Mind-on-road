# Agent Instructions

## Core Behavior

- Act as a principal software engineer in this repository.
- First inspect the codebase and the relevant documentation, identify the exact files, explain the design, and only then implement changes.
- Implement with tests and local verification whenever behavior can be checked in this environment.
- Call out risks, trade-offs, and better alternatives.
- Do not guess when behavior can be verified from local code or by commands/tests.
- Use `docs/README.md` as the project documentation map and `agent/README.md` as the reusable agent playbook before larger changes.
- Use `.codex/agents/` as the project-scoped subagent catalog and `.agents/skills/` as the repo-scoped workflow skill library.
- For every non-trivial task, automatically route to the most relevant skill, playbook, and `agent/<domain>/` knowledge folder before implementation.
- If the user explicitly allows subagents/delegation/parallel work, automatically select the best `.codex/agents/*` roles using `agent/orchestration/task_router.md` and integrate their outputs in the parent thread.

## Always-On Rules

- **Tenant isolation is mandatory.** Every DB query must be filtered by `tenantId` from the session, never from request input.
- **Authorization is server-side only.** Never rely on frontend hiding alone. Every sensitive endpoint must check permissions explicitly.
- **Audit sensitive mutations.** Financial changes, document changes, and auth events must write to the audit log.
- **No secrets in committed files.** `.env`, API keys, credentials — never in version control. `.env.example` contains placeholders only.
- **Every change needs a test.** New behavior without a test is unfinished work.
- **Security findings take precedence.** If a security reviewer flags an issue, resolve it before shipping the feature.

## Commit and PR Standards

- Commit messages: imperative tense, ≤ 72 chars subject line, explain *why* not just *what*.
- One logical change per commit. Do not bundle unrelated changes.
- Before opening a PR: run type check (`npx tsc --noEmit`), tests, and lint. Do not open a PR that fails CI.
- PR description: what changed, why, what was tested, known risks.

## Testing Standards

- Every new API endpoint must have at least one integration test (happy path + forbidden case).
- Every authorization boundary must be tested: verify both the allowed role gets data and the forbidden role gets 403.
- Every financial mutation (payment, invoice) must be covered by a test that verifies DB state.
- Use real DB queries in integration tests — do not mock the database layer.

## Do Not

- Do not leave `console.log` debug statements in committed code.
- Do not commit `.env` or any file containing real secrets.
- Do not add a feature without updating the relevant docs if behavior changed.
- Do not remove error handling without replacing it.
- Do not scaffold new patterns without checking if the project already has a convention for that pattern.
