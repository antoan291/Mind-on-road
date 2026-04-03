---
name: devops-aws-deployment
description: Use for deployment, AWS, CI/CD, Docker, observability, backup/restore, or infrastructure changes and review.
---

# DevOps/AWS deployment skill

## Workflow

1. Read `AGENTS.md`.
2. Read `agent/devops/README.md` and `agent/architecture/README.md`.
3. Review the relevant docs in `docs/architecture/` and `docs/delivery/`.
4. Inspect deployment, Docker, env, CI/CD, infra, and backup files in the codebase.
5. If there is AWS or platform API uncertainty, verify official docs and do not guess.
6. Propose the simplest safe deployment design with rollback, monitoring, and cost/risk trade-offs.
7. If you implement, make small verifiable changes and run local checks when available.
8. Report what changed, what was verified, residual risk, and the next step.

## Review Focus

- secrets/config leakage;
- missing rollback/restore path;
- unclear deployment order;
- Docker image or runtime problems;
- missing healthcheck/observability;
- AWS overengineering or unnecessary cost;
- backup strategy without a real restore process.
