# DevOps Research Notes

## Goal

These notes capture DevOps principles that should be applied in design, deployment, monitoring, recovery, and operational discipline for SaaS products.

## Stable principles to keep

- Fast feedback loops are an operational requirement, not an optimization luxury.
- Deployment must be repeatable and deterministic.
- Infrastructure changes should be documented and, where possible, scripted.
- Monitoring, logging, backup validation, and restore drills are part of delivery quality.
- Security hardening belongs in the delivery pipeline and hosting model, not only in application code.

## For this project

- Treat Hetzner hosting, Nginx, PostgreSQL backups, object storage, and restore playbooks as one connected operating system.
- Separate application deployment from data durability; an app rollback is not a database rollback.
- Keep environment separation explicit: development, staging, and production.
- Record operational runbooks for incidents, restore, key rotation, and failed deployments.
- Prefer simple, observable deployment flows over clever but fragile automation.

## Current source anchors

- The DevOps Handbook
- Existing project backup and disaster recovery architecture
- Existing Hetzner and security decisions already recorded in docs

## Note

The book has been added as a permanent source in `agent/architecture/materials/books/`. In this environment I can safely register it, structure the knowledge layer around it, and synthesize stable DevOps principles into notes. As we keep working on deployment, CI/CD, backup, monitoring, and incident workflows, these notes should be expanded into concrete runbooks.
