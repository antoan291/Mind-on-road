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

---

## Full Security Review Checklist

### Authentication & Session

- [ ] Session tokens generated with `randomBytes(32)` minimum (256-bit entropy).
- [ ] Session tokens hashed (SHA-256 or stronger) before storage — never stored in plaintext.
- [ ] Session secret enforces minimum 32-character length in env schema validation.
- [ ] Cookie flags: `HttpOnly`, `Secure` (all non-development environments), `SameSite=Strict`.
- [ ] CSRF tokens derived from session token via HMAC and compared with `timingSafeEqual`.
- [ ] Login rate-limited (max 5 attempts / 15 min per IP).
- [ ] Login returns identical error message for "user not found" and "wrong password" (prevent enumeration).
- [ ] Change-password requires current password verification and re-authentication.
- [ ] Change-password is rate-limited.
- [ ] Session TTL max is ≤ 24 hours.
- [ ] Sessions are invalidated server-side on logout (token hash deleted or revoked).

### Authorization & Access Control

- [ ] Every sensitive endpoint is guarded by `requireAuthenticatedSession`.
- [ ] Every mutation endpoint checks the required permission key server-side.
- [ ] Multi-tenant isolation: every DB query is filtered by `tenantId` from the session, never from the request body.
- [ ] Role-scoped filtering uses immutable FK IDs (not mutable display names or emails) for instructor/student/parent scope.
- [ ] Student creation/payment/document creation validates that the target `studentId` is within the caller's access scope.
- [ ] No admin-only endpoint is reachable by a non-owner role.
- [ ] Failed permission checks are logged to the audit trail with userId, path, and required permission.

### Input Validation

- [ ] All request bodies are validated against a strict Zod schema before use.
- [ ] UUIDs in path params are validated as valid UUIDs before DB lookup.
- [ ] File names and paths validated with regex and `resolve()` + prefix check before access.
- [ ] No raw SQL string interpolation — Prisma parameterizes all queries.
- [ ] No `exec`, `spawn`, or `eval` on user-supplied input.

### Secrets & Configuration

- [ ] No secrets in `.env.example` — only placeholder comments.
- [ ] `.env` is in `.gitignore` and never committed.
- [ ] All credentials in `docker-compose.yml` reference env vars — no hardcoded values.
- [ ] OpenAI API key is not exposed in any committed file.
- [ ] `SESSION_SECRET` minimum length enforced at startup via schema validation.

### Security Headers

- [ ] CSP enabled with `defaultSrc: ['self']` — not disabled.
- [ ] HSTS enabled (`maxAge: 31536000`, `includeSubDomains: true`, `preload: true`).
- [ ] `referrerPolicy: strict-origin-when-cross-origin`.
- [ ] `x-powered-by` disabled.
- [ ] CORS `origin` is a specific URL, not `*`. `credentials: true` is set.

### Rate Limiting

- [ ] Login: 5 req / 15 min.
- [ ] Change-password: 5 req / 60 min.
- [ ] AI assistant: 30 req / 60 min.
- [ ] OCR run: 10 req / 15 min.
- [ ] Global mutation limiter: ~120 POST/PUT/DELETE / min / IP.

### Error Handling & Information Disclosure

- [ ] Stack traces not returned in API error responses (only in logs).
- [ ] OCR/worker errors return generic user-safe messages — not raw `error.message`.
- [ ] 401/403 responses do not reveal why authorization failed beyond "Unauthenticated" / "Forbidden".

### Audit Trail

- [ ] All authentication events (login success/failure, logout, password change) are recorded.
- [ ] All financial mutations (payment create/update) are recorded.
- [ ] All document mutations are recorded.
- [ ] Failed permission checks are recorded.
- [ ] Audit records include: tenantId, userId, sessionId, ipAddress, userAgent, actionKey, outcome, metadata.

### AI / OCR

- [ ] AI context is tenant-scoped — one tenant cannot cause data from another tenant to leak into prompts.
- [ ] OCR output files are read from a bounded directory with path validation.
- [ ] OpenAI API key has a spending alert configured in the OpenAI dashboard.
- [ ] Per-tenant or per-user AI request budget enforced to prevent runaway costs.

### Dependency Safety

- [ ] `npm audit` shows no critical or high vulnerabilities.
- [ ] No dev dependencies accidentally included in the production bundle.
- [ ] Dependency versions are pinned (no `*` or unbounded ranges for security-sensitive packages).
