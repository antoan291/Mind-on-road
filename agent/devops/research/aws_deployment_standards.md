# AWS And DevOps Deployment Standards

## 1. Goal

This document defines senior-level rules for deployment, AWS infrastructure, CI/CD, observability, secrets management, and backup/restore.

The goal is not to copy the most complex cloud architecture, but to choose the simplest production-safe model that is:

- secure;
- recoverable;
- observable;
- repeatable;
- cost-aware;
- scalable enough for the real stage of the product.

## 2. Architectural Position

For this product, the default position should be:

- simple deployment first;
- managed services only when they truly reduce operational risk;
- a minimal number of moving parts;
- a clear rollback and restore strategy;
- security and observability as required properties, not post-launch add-ons.

Do not introduce Kubernetes, multi-account AWS design, complex service mesh, or heavy event infrastructure just because they sound enterprise-grade if the product does not yet have a measured need for them.

## 3. AWS Principles

### 3.1 Identity And IAM

- Use least privilege.
- Do not use long-lived static IAM credentials if a safer managed identity/role model exists.
- Separate human access from workload access.
- Do not grant wildcard permissions without a strong reason.
- Log and review privileged access.

### 3.2 Network And Exposure

- Expose publicly only what must be public.
- Keep database, cache, and internal services in a private network layer when the architecture allows it.
- Control ingress/egress with security groups and explicit allow rules.
- Do not rely on obscurity instead of network and auth controls.

### 3.3 Compute And Runtime

- Prefer a simple runtime model that is easy to build, deploy, rollback, and debug.
- Docker images should be reproducible, minimal, and free of unnecessary secret leakage.
- Separate runtime config from image build.
- Define health checks and readiness expectations.
- Do not deploy an unverified image/tag without traceability to commit/build.

### 3.4 Data, Storage, And Backup

- PostgreSQL is the source of truth for business data.
- Object storage is the right place for file binaries, while metadata stays in DB.
- A backup strategy without real restore testing is not production-ready.
- Define RPO/RTO expectations and choose backup mechanisms accordingly.
- Critical backups should be protected from accidental or malicious deletion when the infrastructure allows it.

### 3.5 Secrets And Configuration

- Secrets must not live in frontend code, repo files, image layers, or logs.
- Runtime secrets should be delivered through a controlled secrets/config strategy.
- Separate environment-specific config for `development`, `staging`, and `production`.
- Secret rotation should have a documented process.

### 3.6 Observability

- Production deployment without logs, metrics, health checks, and error visibility is incomplete.
- Logs should help with incident debugging but must not leak sensitive data.
- At minimum, you need an application health endpoint, error logs, deployment traceability, and backup/restore alerting.
- AI/OCR/document flows need special attention for audit and failure visibility.

## 4. CI/CD Standards

- The build, test, and deploy pipeline should be deterministic and repeatable.
- Do not deploy if tests/typecheck/build checks for the touched layer are broken.
- Use one clear promotion flow to production, not manual ad-hoc steps without traceability.
- Every production release should map to a commit, build artifact, and change summary.
- The rollback path should be clear before the change, not after an incident.
- Database migrations should be treated as a separate risk and planned for forward/backward compatibility when possible.

## 5. Docker Standards

- Keep Dockerfiles clear, minimal, and free of unnecessary build/runtime dependencies.
- Use `.dockerignore` to avoid sending node_modules, local secrets, test artifacts, or large unnecessary files into build context.
- Prefer a non-root runtime when the image/runtime model allows it.
- Do not mix local-dev convenience with production image behavior without a clear separation.
- Healthcheck/port/config expectations should be explicit.

## 6. Database And Migrations

- Production DB changes require special care for data loss, lock duration, backward compatibility, and rollback.
- Do not execute a destructive migration without backup, review, and a clear recovery plan.
- If backend and migration deploy together, check whether old and new code paths remain compatible during rollout.
- Indexes, constraints, and tenant scoping are part of deployment safety, not just data modeling.

## 7. AWS Approach For This Project

For an early production version, the most reasonable AWS approach is usually:

- one clear backend runtime layer;
- managed PostgreSQL or an equivalent well-backed-up DB strategy;
- S3-compatible object storage or AWS S3 for documents;
- a load balancer/reverse proxy layer with TLS;
- a secrets/config strategy that does not leak into repo or frontend;
- centralized logs/health checks;
- a simple CI/CD pipeline;
- a clear separation between `staging` and `production`.

If infrastructure is not in AWS, these principles still apply, but cloud-specific services should be replaced with equivalents.

## 8. When To Read This Document

Use this document for:

- deployment design;
- choosing between AWS services;
- Docker and runtime changes;
- CI/CD pipeline changes;
- backup/restore architecture;
- observability/monitoring changes;
- incident/rollback planning;
- infrastructure review before production.

## 9. Links To The Current Project

- [agent/devops/README.md](../README.md)
- [agent/architecture/research/devops_research.md](../../architecture/research/devops_research.md)
- [docs/architecture/backup_and_disaster_recovery.md](../../../docs/architecture/backup_and_disaster_recovery.md)
- [docs/architecture/system_architecture.md](../../../docs/architecture/system_architecture.md)
- [docs/architecture/tech_stack_architecture.md](../../../docs/architecture/tech_stack_architecture.md)
- [docs/architecture/security_architecture.md](../../../docs/architecture/security_architecture.md)
