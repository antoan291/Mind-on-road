# QA Knowledge And Verification Workflow

## Purpose

This folder stores reusable QA and verification rules for agent-driven implementation.

## Research Notes

- [research/testing_strategy.md](research/testing_strategy.md)

## Default Verification Order

1. Run the most targeted test for the changed behavior.
2. Run typecheck/build checks for the touched app/package.
3. Check tenant/security edge cases, invalid input, empty states, and concurrency-sensitive paths.
4. If full verification is unavailable, report exactly what was and was not checked.

## Subagent Pairing

Use `qa_reviewer` for test-gap analysis and verification plans. Final sign-off stays in the parent agent after local commands run.
