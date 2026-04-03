---
name: implementation-slice
description: Use when implementing a bounded backend/frontend feature or bug fix with tests while preserving project architecture and tenant/security rules.
---

# Implementation Slice

1. Confirm the exact scope and the files you own for this slice.
2. Inspect existing patterns in nearby modules before editing.
3. Implement the smallest coherent change that preserves module boundaries and project conventions.
4. Keep tenant authorization, validation, auditability, and error handling explicit.
5. Add or update focused tests for the changed behavior.
6. Run targeted verification commands available in the local environment.
7. Report changed files, verification results, risks, and better alternatives if a simpler design exists.

Do not revert unrelated user changes. If concurrent edits affect your files, adapt to them instead of undoing them.
