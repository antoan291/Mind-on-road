# Node.js Best Practices Notes

## Source

- GitHub: https://github.com/goldbergyoni/nodebestpractices

## Why this source matters

Това repo е силен practically-oriented reference за Node.js architecture, error handling, code style, testing, production readiness и security.
То не замества нашата архитектура, но служи като постоянен backend quality standard.

## Stable principles to apply in this project

- Structure the backend by business components or modules, not by technical file type only.
- Keep the web layer thin and do not let transport details leak into domain logic.
- Use environment-aware and secure configuration.
- Prefer async/await over callback-heavy flows.
- Use explicit, centralized error handling.
- Distinguish operational errors from programmer or catastrophic errors.
- Use a mature logger and make failures observable.
- Validate inputs early and fail fast on bad arguments.
- Keep tests organized, readable, and close to real component behavior.
- Treat production readiness as part of development, not a late phase.

## What maps directly to our architecture

- The repo recommends component-oriented structure; this matches our modular backend direction.
- The repo emphasizes centralized error handling; this should shape our Node.js error handling and logging strategy.
- The repo emphasizes distinguishing operational and programmer errors; this is especially important for payments, documents, OCR and AI workflows.
- The repo treats monitoring and production concerns as first-class; this aligns with our backup, audit and Hetzner operational model.

## What not to copy blindly

- Do not copy generic recommendations without filtering them through our current stack and product scale.
- Do not introduce abstraction layers only because a guide mentions them.
- Do not split modules too early; keep boundaries strong, but keep the system simpler than the maximum architecture the source can support.

## Current usage rule

Use this file as a backend engineering reference whenever we touch Node.js architecture, module boundaries, validation, logging, error handling, testing or production readiness.
