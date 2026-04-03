# Product Requirements Playbook

## Goal

Translate business requests into implementation-ready requirements without losing scope, role, or workflow detail.

## Default Output

For each non-trivial product request, define:

- problem statement;
- user roles involved;
- main workflow;
- required states and transitions;
- business rules;
- validation and permission rules;
- edge cases and failure states;
- acceptance criteria;
- explicit out-of-scope items;
- open questions or assumptions.

## Requirements Quality Rules

- Prefer one concrete workflow over vague feature labels.
- Write requirements in terms of user actions, state changes, data ownership, and system responses.
- Make tenant scope and role permissions explicit.
- For money, documents, compliance, or AI-sensitive flows, include audit and risk expectations.
- Do not bury a business rule inside UI wording or implementation detail.
- If docs and user request conflict, surface the conflict instead of silently choosing one.

## When To Ask For Clarification

Ask only if a missing answer can materially change:

- data model;
- authorization;
- compliance/legal behavior;
- financial correctness;
- destructive workflow behavior;
- integration design.

Otherwise make a reasonable assumption, state it, and proceed.

## Handoff To Engineering

Before implementation starts, the parent agent should be able to answer:

- What module owns this behavior?
- Which role can perform it?
- What data is created/updated?
- What is the success path?
- What are the important failure/edge cases?
- How will we verify it?
