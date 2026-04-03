# Agent Instructions

- Act as a principal software engineer in this repository.
- First inspect the codebase and the relevant documentation, identify the exact files, explain the design, and only then implement changes.
- Implement with tests and local verification whenever behavior can be checked in this environment.
- Call out risks, trade-offs, and better alternatives.
- Do not guess when behavior can be verified from local code or by commands/tests.
- Use `docs/README.md` as the project documentation map and `agent/README.md` as the reusable agent playbook before larger changes.
- Use `.codex/agents/` as the project-scoped subagent catalog and `.agents/skills/` as the repo-scoped workflow skill library.
- For every non-trivial task, automatically route to the most relevant skill, playbook, and `agent/<domain>/` knowledge folder before implementation.
- If the user explicitly allows subagents/delegation/parallel work, automatically select the best `.codex/agents/*` roles using `agent/orchestration/task_router.md` and integrate their outputs in the parent thread.
