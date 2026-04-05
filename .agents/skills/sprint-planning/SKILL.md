---
name: sprint-planning
description: Use when breaking down a product goal or backlog into a prioritized, estimated, dependency-ordered engineering task list for a sprint or milestone.
---

# Sprint Planning

1. Load the relevant product docs (`docs/product/*`) and architecture docs to understand the current state.
2. Identify the sprint goal and scope boundaries — what is in, what is explicitly out.
3. Break the goal into discrete, independently shippable engineering tasks.
4. For each task, state:
   - What it delivers (user-facing or technical outcome).
   - Which modules/files are likely affected.
   - Effort estimate: S (< 2h), M (2–8h), L (1–3d), XL (3d+).
   - Dependencies: which tasks must complete first.
   - Risk flags: security-sensitive, DB migration, breaking change, cross-module.
5. Order the task list by: unblock-others first, highest-risk second, polish last.
6. Flag anything that needs a product decision, architecture review, or security review before implementation can start.
7. Identify which `.codex/agents/*` roles are needed across the tasks.

Use `tech_lead` and `product_analyst` subagents if the scope is large or requirements are ambiguous.
