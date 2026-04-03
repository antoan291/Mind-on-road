# Parent-Agent And Subagent Operating Model

## Sources

- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Codex AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Codex Skills](https://developers.openai.com/codex/skills)
- [Codex Best Practices](https://developers.openai.com/codex/learn/best-practices)
- [Claude Subagents in the SDK](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Claude overview](https://platform.claude.com/docs/en/overview)

## Design Principles

- Keep `AGENTS.md` short and always-on.
- Put deeper reusable workflows in `.agents/skills/` and `agent/playbooks/`.
- Use custom subagents only for narrow, clearly scoped roles with strong `description` text.
- Split read-heavy exploration/review from write-heavy implementation to reduce context pollution and accidental edits.
- Keep subagent prompts self-contained: pass file paths, constraints, and expected output directly in the task.
- Run independent subagents in parallel, but keep the parent agent responsible for the critical path and final integration.
- Keep nesting depth at 1 unless there is a strong reason to recurse.
- Prefer official docs and local repo inspection over memory when behavior can be verified.

## Runtime Layers

- `AGENTS.md` - global repo instructions loaded by Codex.
- `.codex/config.toml` - max thread/depth limits for subagent fan-out.
- `.codex/agents/*.toml` - custom Codex subagents.
- `.agents/skills/*/SKILL.md` - reusable workflow skills discoverable by Codex.
- `agent/playbooks/` - human-readable operating procedures.
- `agent/<domain>/` - reusable knowledge by domain.
- `agent/orchestration/task_router.md` - automatic task-to-skill/subagent routing map.

## Parent-Agent Responsibilities

- Classify the task type and automatically load the matching skill/playbook/domain docs.
- Decide whether the task should run locally only or with parallel subagents.
- Keep the immediate blocking task local.
- Delegate only independent sidecar work with bounded scope and clear expected output.
- Integrate subagent findings into one coherent design/patch.
- Run or request final verification and report residual risks.

## Subagent Responsibilities

- Stay within the assigned role and file scope.
- Return concise, evidence-backed outputs.
- Do not duplicate work already assigned to another agent.
- Do not revert unrelated changes.
- If blocked, report the blocker and the smallest next question or action.

## When To Spawn Subagents

Use subagents for:

- parallel codebase exploration across separate domains;
- independent backend/frontend/security/QA review passes;
- bounded implementation slices with disjoint file ownership;
- documentation/API research in parallel with local code inspection.

Do not spawn subagents for:

- the immediate blocking step on the critical path;
- tightly coupled edits in the same files;
- broad vague tasks without a clear role, scope, and output format;
- recursive delegation unless explicitly designed.

## Default Auto-Routing Flow

1. Classify the user request using [task_router.md](task_router.md).
2. Load the matching `.agents/skills/*` workflow and `agent/<domain>/README.md` knowledge index.
3. Inspect code and docs locally.
4. If the user explicitly allows subagents, choose the recommended `.codex/agents/*` roles and delegate only non-blocking work.
5. Merge findings, implement, verify, and report.
