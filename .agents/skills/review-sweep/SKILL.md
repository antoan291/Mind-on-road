---
name: review-sweep
description: Use when reviewing a branch, PR, or implementation for correctness, security, test gaps, architectural regressions, and operational risks.
---

# Review Sweep

Review in this order:

1. Correctness and behavioral regressions.
2. Tenant isolation, authorization, and sensitive-data handling.
3. Data integrity, migrations, and transactional safety.
4. Missing tests and weak edge-case coverage.
5. Operational/logging/audit risks and maintainability.

Output format:

- Findings first, ordered by severity.
- Each finding should include file references, concrete impact, and a remediation suggestion.
- Then list open questions/assumptions and a short verification summary.

Avoid style-only comments unless they hide a real bug.
