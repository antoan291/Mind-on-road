---
name: ux-review
description: Use when reviewing or implementing frontend flows where interaction clarity, consistency, accessibility, empty/error/loading states, or admin workflow usability matters.
---

# UX Review

## Workflow

1. Read `AGENTS.md`, `agent/ux/README.md`, `agent/frontend/README.md`, and relevant `docs/product/*` docs.
2. Identify the user role, task flow, and expected states.
3. Review UI behavior for:
   - clarity of primary/secondary actions;
   - consistent dialogs/drawers/navigation patterns;
   - form usability and validation;
   - empty, loading, and error states;
   - accessibility and keyboard/focus behavior;
   - table/card information hierarchy.
4. If implementation is needed, keep changes consistent with existing project UI conventions and test critical interactions.
5. Report concrete findings or changed files, plus residual UX risks and verification performed.

Avoid subjective visual-only feedback unless it affects usability or business correctness.
