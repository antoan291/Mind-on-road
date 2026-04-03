# AI Agent Operating Package

## Purpose

This folder defines how Codex should work in the MindOnRoad repository and acts as a portable agent package that can be copied into a new project.

`AGENTS.md` contains the short always-on rules. This folder contains the deeper execution playbooks, reusable research notes, source registry, and engineering lessons.

## Main Playbooks And Orchestration

- [orchestration/task_router.md](orchestration/task_router.md)
- [playbooks/principal_engineer_playbook.md](playbooks/principal_engineer_playbook.md)
- [playbooks/task_prompt_templates.md](playbooks/task_prompt_templates.md)
- [orchestration/README.md](orchestration/README.md)
- [orchestration/delegation_matrix.md](orchestration/delegation_matrix.md)

## Runtime Agent/Skill Wiring

- [../.codex/config.toml](../.codex/config.toml) - Codex subagent concurrency/depth settings
- [../.codex/agents/](../.codex/agents) - project-scoped custom subagent definitions
- [../.agents/skills/](../.agents/skills) - repo-scoped workflow skills Codex can discover automatically

## Knowledge Layer

- [architecture/](architecture/README.md) - system design, data architecture, and DevOps/reliability knowledge
- [backend/](backend/README.md) - Node.js/backend books, reference docs, and synthesized notes
- [database/](database/README.md) - PostgreSQL/Prisma schema, migration, and tenant data safety knowledge
- [devops/](devops/README.md) - senior deployment, CI/CD, AWS, and operational knowledge
- [frontend/](frontend/README.md) - frontend reference docs and synthesized UI engineering notes
- [product/](product/README.md) - product/business analysis and requirements decomposition knowledge
- [qa/](qa/README.md) - reusable testing and verification workflow
- [security/](security/README.md) - reusable security review workflow
- [ux/](ux/README.md) - B2B admin UX and product design review knowledge
- `logs/version_journal.md` - important changes and decisions
- `logs/error_and_lessons_log.md` - mistakes, consequences, and permanent rules
- `source_registry.md` - central list of books, GitHub repos, and key docs

## Default Working Mode

For non-trivial project tasks, work in this order:

1. Read `AGENTS.md`.
2. Read `docs/README.md`.
3. Read the relevant product, architecture, backend, and frontend docs for the task.
4. Inspect the codebase and identify the exact implementation files.
5. Briefly explain the design and trade-offs.
6. Implement the change.
7. Run the most relevant local verification/tests available in this environment.
8. Report what changed, what was verified, and what risks remain.

## What Belongs Here

- agent workflows;
- reusable prompt patterns;
- code review and implementation checklists;
- project-specific execution rules;
- portable engineering research and source notes;
- lessons and version logs that should survive moving to a new project;
- rules that should influence how Codex works in this repository.

## What Does Not Belong Here

- product requirements;
- business strategy;
- system architecture specs for the concrete product;
- generated build artifacts.

Those belong in the normal `docs/` tree for project and engineering documentation, not in `agent/`.

## Operating Principle

1. Record major decisions and changes in `logs/version_journal.md`.
2. Record mistakes and anti-repeat rules in `logs/error_and_lessons_log.md`.
3. Register important external sources in `source_registry.md`.
4. Distill durable engineering lessons into the relevant domain folder under `agent/*/research/`.
5. Keep short mandatory behavior in `AGENTS.md`, detailed workflows in `playbooks/`, and delegation rules in `orchestration/`.
