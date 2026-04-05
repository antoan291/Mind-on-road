---
name: tech-debt-review
description: Use when auditing the codebase for technical debt, prioritizing what to pay off, and producing a remediation plan ordered by risk vs effort.
---

# Tech Debt Review

1. Inspect the codebase for the following debt categories:
   - **Security debt**: missing authorization checks, weak secrets, unvalidated inputs.
   - **Data integrity debt**: missing constraints, unindexed FK columns, unsafe migrations.
   - **Architecture debt**: modules that violate boundaries, giant files, copy-pasted logic, missing abstractions.
   - **Operational debt**: missing error handling, silent failures, no structured logging, no audit trail.
   - **Test debt**: untested auth boundaries, untested financial mutations, flaky or no tests.
   - **Performance debt**: N+1 queries, missing indexes, unbounded list fetches, large bundle chunks.
   - **Maintenance debt**: stale docs, wrong comments, dead code, unused dependencies.

2. For each item, record:
   - Category and severity (Critical / High / Medium / Low).
   - File and location.
   - Concrete risk if left unaddressed.
   - Estimated remediation effort (S / M / L / XL).

3. Produce a prioritized payoff order: Critical security and data integrity first, then high operational risk, then architecture, then maintenance.

4. Recommend which `.codex/agents/*` roles should own each remediation item.

Use `tech_lead`, `security_reviewer`, `performance_engineer`, and `architect_reviewer` subagents if the scope spans multiple domains.
