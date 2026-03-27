# KursantAI / DriveAdmin

## Архитектура на сигурността

## 1. Цел на документа

Този документ описва security architecture за продукта KursantAI / DriveAdmin.

Сигурността е критична, защото системата съхранява:

- лични данни;
- финансови данни;
- документи;
- административни записи;
- чувствителна история и audit информация.

## 2. Главен security принцип

Продуктът трябва да бъде проектиран по модела:

- secure by default;
- least privilege;
- defense in depth;
- deny by default;
- audit everything important.

При цел за multi-tenant SaaS с около 10 000 дневно активни потребители security моделът трябва да е проектиран не само за защита на единична школа, а и за контролирана изолация между много клиенти, по-голям operational surface и по-висока вероятност от грешки в authorization, caching и background processing.

## 3. Основни security слоеве

### 3.1 Identity layer

- сигурна автентикация;
- защитени сесии;
- password hashing с `argon2id`;
- optional MFA за административни роли;
- защита срещу credential stuffing и brute force.

### 3.2 Access control layer

- role-based access control;
- tenant-scoped permissions;
- object-level checks при чувствителни операции;
- server-side authorization always.

### 3.3 Data protection layer

- encryption in transit;
- encryption at rest;
- secure file storage;
- signed file access;
- ограничен direct exposure на документи.

### 3.4 Audit layer

- лог на чувствителни действия;
- лог на документален достъп;
- лог на критични финансови промени;
- лог на security events.

### 3.5 AI security layer

- tenant-scoped AI context;
- redaction на излишни лични данни в AI заявки;
- logging на AI actions;
- human review при OCR и auto-fill;
- deny-by-default за достъп до чувствителни документи през AI flows.

Допълнително:

- AI няма direct access до цялата production база;
- retrieval, chat context и OCR access са разрешени само в рамките на текущия `tenant_id`;
- customer data не се използват като shared training corpus между различни школи;
- AI memory, ако съществува, трябва да бъде tenant-scoped и tenant-isolated;
- AI caches и context snapshots не трябва да се reuse-ват между tenants.
- OpenAI service credentials се държат само в backend и secret manager, не per-tenant в клиентския слой.

### 3.6 SaaS scale security layer

- tenant isolation validation на всеки слой;
- rate limits и quotas по tenant, потребител и интеграция;
- cache safety, така че данни от един tenant да не могат да се върнат на друг;
- worker/job isolation за background processing;
- централизирано откриване на cross-tenant аномалии;
- готовност за по-силен isolation модел за enterprise tenants.

## 4. Authentication модел

Препоръчителен модел:

- email/password login;
- secure session cookies;
- server-side session store;
- refresh чрез session rotation, не чрез complex client-side token model;
- optional TOTP MFA за high-privilege roles.

### 4.1 Пароли

Задължително:

- `argon2id`
- unique random salt
- server-side password policy
- reset token with expiration and one-time use

### 4.2 Сесии

Сесиите трябва да бъдат:

- HTTP-only;
- Secure;
- SameSite=Lax или Strict where possible;
- invalidatable server-side;
- device/session manageable for admins.

## 5. Authorization модел

Продуктът трябва да има поне три нива на authorization:

- tenant-level access;
- role-level access;
- record-level access.

Пример:

- администратор на школа вижда само своя tenant;
- администрация на школа работи само в рамките на своя tenant и своите оперативни права;
- инструктор вижда само своите ученици, своя график и своя автомобил в рамките на служебния си обхват;
- ученик вижда само своите записи.

## 6. Tenant isolation

Tenant isolation не трябва да е само frontend логика.

Трябва да съществува на:

- API layer;
- query layer;
- database layer за критични таблици.

Препоръка:

- mandatory `tenant_id` scoping in repositories;
- automated guards/interceptors;
- PostgreSQL RLS за чувствителни домейни като документи, плащания, фактури, студентски записи.

### 6.1 Tenant isolation при 10 000 DAU

При растящ multi-tenant SaaS най-опасният клас дефекти не е инфраструктурен срив, а изтичане на данни между tenants.

Затова tenant isolation трябва да се валидира в:

- route guards;
- service layer authorization;
- query builders и repository helpers;
- cache keys;
- background jobs;
- export/import pipelines;
- AI/OCR flows;
- signed URL generation.

Задължително:

- всеки cache key да съдържа `tenant_id`;
- всеки background job payload да съдържа `tenant_id`;
- всеки async consumer да валидира `tenant_id` преди изпълнение;
- всеки export файл да е проследим до конкретен tenant и конкретен requestor;
- автоматизирани integration tests за cross-tenant access denial.

## 7. Документи и файлове

Документите са най-чувствителният ресурс в системата.

### 7.1 Правилен модел

- файлът се съхранява в object storage;
- metadata се пази в PostgreSQL;
- достъпът минава през authorization слой;
- backend издава signed URL с кратък живот;
- direct public file access е забранен.

### 7.2 Задължителни мерки

- private buckets;
- server-side encryption at rest;
- checksum validation;
- mime type validation;
- maximum file size rules;
- file extension allowlist;
- antivirus scan;
- download/view access log.

### 7.3 Sensitive document controls

За особено чувствителни файлове:

- watermark или view-only mode в по-късен етап;
- short-lived access links;
- revoke path;
- separate policy for admin-only documents.

### 7.4 OCR и AI обработка на документи

При OCR и AI extraction трябва да важат допълнителни правила:

- само backend услугата има право да извлича съдържание от документ;
- суровите изображения и файлове не се подават към неразрешени външни услуги;
- извлечените полета се пазят отделно и подлежат на потвърждение;
- auto-fill към официални данни не се допуска без human review при чувствителни документи;
- всеки OCR run се логва с provider, модел, време и резултат.

При owner chat и други AI заявки:

- контекстът се подава само след tenant-aware authorization;
- AI не трябва да вижда документи или записи от друг tenant;
- всяка retrieval заявка трябва да е tenant-filtered преди да стигне до модела.

## 8. API security

Backend API трябва да прилага:

- rate limiting;
- CSRF protection where applicable;
- input validation on all endpoints;
- output filtering;
- structured authorization checks;
- secure headers.

### 8.1 Headers

Минимум:

- HSTS
- CSP
- X-Frame-Options or frame-ancestors policy
- X-Content-Type-Options
- Referrer-Policy

### 8.1.1 Edge / reverse proxy security

Препоръчително е публичният вход към системата да минава през `Nginx`.

Ролята му е:

- TLS termination;
- централизирано прилагане на security headers;
- request size limits за uploads;
- basic request filtering;
- timeout и buffering контрол;
- скриване на директния достъп до вътрешните app инстанции.

Задължително:

- `React` приложението и Node.js backend инстанциите да не са директно публично достъпни;
- да има allowlist на trusted proxy headers;
- да има upload size ограничения за document endpoints;
- да се ограничат ненужните HTTP methods;
- да се изключи leakage на server version headers, когато е възможно.

### 8.2 Rate limiting и quota модел за SaaS

При около 10 000 DAU rate limiting не е само защита срещу атаки, а и защита на платформата от noisy tenants, automation bursts и дефектни integrations.

Препоръка:

- global limits на edge/API ниво;
- tenant-level limits за чувствителни операции;
- per-user limits за login, export, OCR upload и AI chat;
- stricter limits за admin-only операции;
- отделни budgets за OCR и AI usage по tenant.

Чувствителни endpoints, които трябва да имат по-строг контрол:

- login и password reset;
- document upload/download;
- OCR extraction;
- AI owner chat;
- bulk export;
- invoicing and payment mutations;
- notification triggering.

## 9. Database security

### 9.1 Access

- database не трябва да е публично достъпна;
- достъпът е само от приложните услуги;
- production credentials в secret manager;
- отделни credentials per environment.

### 9.2 Sensitive columns

Препоръчително е допълнително field-level encryption за специфични чувствителни стойности, ако регулаторният риск го изисква.

Кандидати:

- лични идентификатори;
- много чувствителни бележки;
- части от документи metadata при нужда;
- OCR extracted values;
- driving license numbers и ID document numbers.

### 9.3 Audit

Критичните промени трябва да се пазят в append-only audit log.

### 9.4 Read replica security

Ако се използват PostgreSQL read replicas за scale-out:

- replica connection-ите трябва да са read-only credentials;
- чувствителни административни операции никога не трябва да ползват replica;
- replica lag трябва да се следи, за да не се показват подвеждащи данни за плащания, графици и документи;
- reporting и dashboard reads могат да се изнасят към replica само когато UX допуска евентуална кратка stale стойност;
- tenant isolation и RLS правилата трябва да важат еднакво и за primary, и за replica пътя.

## 10. Job и notification security

Всички background jobs трябва да бъдат:

- tenant-aware;
- idempotent;
- auditable;
- retry-safe;
- protected against duplicate sending.

Особено за:

- Viber съобщения;
- payment reminders;
- theory absence notifications;
- document expiry alerts.

За AI jobs важат и:

- ограничен tenant-scoped input context;
- rate limiting и budget control;
- retry само при безопасни idempotent операции;
- не се допуска мълчаливо презаписване на официални данни.

### 10.1 Worker isolation и queue security

При 10 000 DAU background processing става критичен security слой, защото през него минават съобщения, OCR, AI, напомняния и batch операции.

Задължително:

- job payload-ите да са минимални и tenant-scoped;
- worker-ите да работят с least-privilege credentials;
- retry логиката да е bounded и auditable;
- dead-letter опашките да се пазят ограничено и сигурно;
- batch jobs да не могат да сканират записи извън разрешения tenant scope;
- duplicate-send protection за Viber, email и AI-triggered actions.

## 11. Secret management

Secrets не трябва да живеят в source control.

Задължително:

- environment-based secrets;
- secret manager in production;
- key rotation policy;
- separate secrets per environment;
- separate service credentials where practical.

### 11.2 AI provider credentials модел

Препоръката е:

- един production OpenAI project;
- отделни provider credentials по environment;
- без отделен provider token за всеки tenant като стандартен модел;
- tenant-level usage control в нашата система, не в client-side или per-tenant key distribution.

Това намалява:

- ключовия operational шум;
- риска от лошо secret management;
- сложността при ротация на ключове;
- риска tenant credentials да бъдат изнесени извън контролирания backend слой.

### 11.1 Redis и cache security

Ако платформата използва Redis за cache, rate limiting и distributed coordination:

- Redis не трябва да е публично достъпен;
- достъпът трябва да е само от приложните услуги и worker-ите;
- TLS и authentication трябва да са активни при managed deployment;
- не се съхраняват дългоживеещи чувствителни документи или сурови OCR изображения в Redis;
- cache TTL трябва да е кратък за чувствителни справки;
- invalidation правила трябва да са ясни при промяна на tenant permissions.

## 12. Logging and monitoring

Security logging трябва да покрива:

- login success/failure;
- password reset flow;
- MFA events;
- suspicious access attempts;
- document access;
- permission denied actions;
- critical financial changes;
- tenant-boundary violations.

Допълнително за AI:

- OCR run start/finish/failure;
- извлечени и потвърдени полета;
- owner chat requests с metadata;
- prediction generation и приемане/отхвърляне;
- опит за AI достъп до забранен документален ресурс.

### 12.1 SaaS anomaly detection

При multi-tenant SaaS трябва да има отделни сигнали за:

- необичаен burst на document downloads;
- необичайно висок OCR usage от tenant;
- нетипично много failed logins за конкретна школа;
- опити за достъп до records от чужд tenant;
- подозрително много exports за кратко време;
- spikes в AI chat usage или OCR failures;
- unusual admin actions извън обичайно работно време.

## 13. Backup security

Backup-ите трябва да бъдат:

- encrypted;
- access-controlled;
- tested for restore;
- retained by policy;
- отделени от live environment.

## 14. SaaS-specific security posture

Тъй като продуктът ще се продава на повече автошколи:

- tenant boundary testing е задължително;
- onboarding/offboarding процесите трябва да са формализирани;
- tenant-specific data export трябва да е контролирана;
- admin impersonation, ако някога се добави, трябва да има тежък audit.

### 14.1 Security posture за 10 000 DAU

При цел около 10 000 DAU системата трябва да има по-зряла operational security дисциплина:

- централизирани security logs;
- alerting за cross-tenant и document-related anomalies;
- formal incident response playbook;
- по-строг review на schema migrations, които засягат authorization и tenant boundaries;
- capacity protection срещу tenant bursts чрез quotas и rate limits;
- controlled feature flags за AI и OCR функционалности.

Това не означава, че още от ден 1 е нужен enterprise-grade complexity stack. Означава, че архитектурата трябва да е подготвена да расте без да жертва изолацията между школите.

## 15. Minimum security roadmap

### Phase 1

- secure sessions
- RBAC
- tenant scoping
- private object storage
- audit log
- encrypted backups
- rate limiting
- validation
- AI audit logging
- OCR review workflow

### Phase 2

- MFA for admin roles
- RLS on sensitive domains
- antivirus scanning pipeline
- anomaly alerts
- stronger document access analytics
- field-level encryption за OCR extracted sensitive values
- AI prompt/data minimization controls
- tenant quota controls
- Redis/cache hardening
- cross-tenant automated test suite

### Phase 3

- enterprise tenant isolation options
- field-level encryption for selected data
- advanced compliance controls
- SIEM/export-ready security event pipeline
- premium tenant isolation tier при нужда

## 16. Окончателна security препоръка

Най-добрият security модел за този продукт е:

- server-side sessions;
- `Nginx` като reverse proxy и edge hardening слой;
- tenant-aware RBAC;
- private object storage with signed URLs;
- strong validation and rate limiting;
- append-only audit logging;
- encrypted backups;
- least-privilege service design;
- AI/OCR security with human review and tenant-scoped context;
- gradual hardening with MFA, RLS, quota controls and document security controls.

Това е най-добрият баланс между:

- реална сигурност;
- поддържаемост;
- operational simplicity;
- readiness for future SaaS growth до и над 10 000 DAU.
