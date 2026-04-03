# B2B Admin UX Review Standards

## Goal

Define practical UX review rules for workflow-heavy admin software where clarity, consistency, and low operator error matter more than visual novelty.

## Review Priorities

- Is the primary action obvious for the current user role and context?
- Are secondary/destructive actions visually and behaviorally distinct?
- Does the screen preserve context when opening details, edits, or quick actions?
- Are table/card/drawer/dialog patterns consistent across modules?
- Are empty, loading, error, validation, and permission-denied states explicit?
- Can a user understand what changed after save/submit?
- Are labels, statuses, and data groupings aligned with business terminology?
- Are keyboard, focus, and basic accessibility expectations respected?

## Form Rules

- Group related fields by business meaning.
- Make required/optional/error states clear.
- Prefer constrained inputs for enums/status values and business-safe formats.
- Do not hide important validation behind submit-only surprise errors.
- Preserve user input and context after recoverable validation failures.

## Data-Heavy Screen Rules

- Keep filters, sorting, and selected state predictable.
- Preserve context when opening a detail drawer from a list.
- Make row/card status and risk indicators readable without forcing click-through.
- Avoid mixing unrelated metrics or actions in one panel.

## Admin SaaS Anti-Patterns

- Too many unrelated actions with equal visual weight.
- Modals/drawers that break the current workflow context.
- Tables with weak status hierarchy or ambiguous icons.
- Hidden permission failures that only appear after user effort.
- Inconsistent naming for the same business concept across screens.
