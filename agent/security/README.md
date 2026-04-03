# Security Review Workflow

## Purpose

This folder stores reusable security review rules for SaaS, tenant isolation, documents, payments, and AI/OCR flows.

## Review Priority

1. Authentication and session handling.
2. Tenant-scoped authorization and object-level access checks.
3. Sensitive document access and signed URL/storage behavior.
4. Auditability and integrity for financial mutations.
5. Secret handling and backend-only service credentials.
6. AI/OCR prompt/context isolation and redaction.

## Subagent Pairing

Use `security_reviewer` for a read-only adversarial pass, then let the parent agent decide whether to patch directly or assign a bounded implementation task.
