---
name: repo-onboarding
description: Use at the start of a non-trivial task in this repository when you need to orient on docs, module boundaries, existing conventions, and relevant files before implementation.
---

# Repo Onboarding

Follow this workflow before non-trivial implementation:

1. Read `AGENTS.md`.
2. Read `docs/README.md`.
3. Read `agent/README.md` and `agent/orchestration/README.md`.
4. Identify the task domain and inspect the relevant `docs/` and `agent/<domain>/README.md` files.
5. Search the codebase for the relevant routes, modules, schemas, and tests.
6. Return a concise map of involved files, current design, risks, and proposed implementation sequence.

Do not skip verification opportunities and do not guess behavior that can be checked locally.
