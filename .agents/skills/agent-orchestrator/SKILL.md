---
name: agent-orchestrator
description: Use for every non-trivial repository task when you need to automatically select the right workflow skill, domain knowledge folder, and optional subagent roles before implementation.
---

# Agent Orchestrator

## Goal

Route each non-trivial task to the best workflow, knowledge sources, and optional subagent roles before implementation.

## Workflow

1. Read `AGENTS.md`.
2. Read `agent/orchestration/task_router.md`.
3. Classify the user request into one or more task types from the routing table.
4. Load the matching `.agents/skills/*` workflows and relevant `agent/<domain>/README.md` files.
5. Inspect the relevant project docs in `docs/`.
6. Inspect the codebase and identify the exact implementation files.
7. If the user explicitly allows subagents/delegation/parallel work, choose the recommended `.codex/agents/*` roles and assign only independent sidecar tasks.
8. Keep the immediate blocking task in the parent agent.
9. Integrate findings, implement or review, run local verification, and report risks and next steps.

## Output contract

For larger tasks, provide a concise execution plan that names:

- task classification;
- files/docs to inspect;
- selected skills/playbooks;
- selected subagents if delegation is explicitly allowed;
- verification commands or checks.

Do not spawn subagents unless the user explicitly asks for subagents, delegation, or parallel agent work.
