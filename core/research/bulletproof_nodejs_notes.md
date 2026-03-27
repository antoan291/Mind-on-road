# Bulletproof Node.js Notes

## Source

- GitHub: https://github.com/santiq/bulletproof-nodejs

## Why this source matters

Това repo е полезно като practically-oriented пример за Node.js backend structure, service layering, validation и operational setup за малки и средни проекти.
То е особено полезно като мислене за разделяне на controller, service, config и loader слоеве.

## Stable ideas worth keeping

- Keep route-level validation explicit and close to the endpoint.
- Separate bootstrapping concerns from business modules.
- Keep service logic outside controllers.
- Use dedicated config loading instead of scattered environment access.
- Organize the codebase so that a new developer can understand where each responsibility lives.
- Prefer pragmatic structure that a small team can really operate.

## What to filter through our current stack

- The repo uses Express, older Node assumptions, MongoDB-oriented choices and libraries that are not automatically our default.
- We should keep the structural lessons, not necessarily the exact packages or file tree.
- Our current architecture remains modular monolith, tenant-aware SaaS, PostgreSQL plus Prisma, and stronger security requirements than a generic starter.

## Practical use for this project

- Use it as a structure reference when shaping backend modules and bootstrapping.
- Use it as a validation reference for request-level schemas.
- Use it as a reminder to keep transport, service and startup concerns separated.
- Do not use it as justification for premature complexity or outdated dependency choices.
