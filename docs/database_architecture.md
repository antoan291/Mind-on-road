# MindOnRoad

## Архитектура на базата данни

## 1. Цел на документа

Този документ описва препоръчителната database architecture за продукта MindOnRoad.

Фокусът е върху:

- коректност;
- консистентност;
- multi-tenant готовност;
- сигурност;
- auditability;
- добра еволюция на схемата.

## 2. Основна database стратегия

Правилната database стратегия за този продукт е:

- една основна PostgreSQL база;
- shared schema multi-tenant модел;
- `tenant_id` в tenant-owned таблиците;
- силни foreign keys вътре в базата;
- силни DB constraints за критични правила;
- append-only audit за чувствителни действия.

Не препоръчвам database-per-service в този продукт.

## 3. Главни принципи

### 3.1 PostgreSQL е source of truth

Всички критични бизнес данни трябва да живеят в PostgreSQL:

- ученици;
- инструктори;
- автомобили;
- графици;
- практически часове;
- теория;
- плащания;
- фактури;
- документи metadata;
- OCR extraction records;
- AI predictions;
- AI conversations metadata;
- административни действия;
- audit записи.

### 3.2 Tenant isolation

Всички tenant-owned таблици трябва да имат:

- `tenant_id UUID NOT NULL`

Всички уникални индекси трябва да бъдат tenant-aware.

Пример:

- правилно: unique `(tenant_id, invoice_number)`
- грешно: unique `(invoice_number)`

### 3.2.1 Tenant scaling позиция за 10 000 DAU

Shared schema + `tenant_id` остава правилният модел и при около 10 000 DAU, ако базата се дисциплинира правилно.

Задължително е:

- всеки основен lookup и list query да започва с `tenant_id`;
- композитните индекси да са tenant-first;
- големите таблици да имат ясни стратегии за архивиране и retention;
- heavy reporting да се изнася към read replicas или materialized read модели.

### 3.3 Време

Всички timestamps:

- `TIMESTAMPTZ`
- UTC в базата
- локална визуализация в приложението

### 3.4 Пари

Всички парични стойности:

- като integer minor units
- например `amount_minor BIGINT`
- отделно поле `currency CHAR(3)`

Причина:

- избягване на floating point грешки;
- по-надеждна финансова логика.

### 3.5 Изтриване

За чувствителни и бизнес важни данни:

- soft delete при нужда;
- или status-based retirement;
- не hard delete по подразбиране.

Особено за:

- плащания;
- фактури;
- документи metadata;
- audit;
- критични административни записи.

## 4. Препоръчителни логически схеми

За по-добра организация вътре в една база препоръчвам логическо разделяне чрез PostgreSQL schemas:

- `identity`
- `core`
- `scheduling`
- `billing`
- `documents`
- `notifications`
- `audit`
- `reporting`
- `ai`

Това не е задължително за runtime, но е много полезно за архитектурна дисциплина.

## 5. Основни таблици по домейн

### 5.1 Identity и tenancy

- `tenants`
- `users`
- `user_sessions`
- `roles`
- `permissions`
- `user_role_assignments`

### 5.2 Core domain

- `students`
- `student_enrollments`
- `student_categories`
- `parents`
- `student_parent_links`
- `instructors`
- `vehicles`
- `theory_groups`
- `student_training_milestones`
- `student_compliance_profiles`
- `student_certification_records`

### 5.3 Scheduling domain

Препоръчителен модел:

- `calendar_events`
- `practical_lessons`
- `theory_lectures`
- `resource_blocks`

Идея:

- `calendar_events` е общият времеви контейнер;
- специализираните таблици съдържат бизнес-специфичните полета.

Така schedule UI има една обща времева основа, а домейнът остава ясен.

### 5.4 Billing domain

- `payment_plans`
- `payments`
- `receivable_installments`
- `payment_allocations`
- `invoices`
- `invoice_items`
- `payment_invoice_links`

### 5.4.1 Reporting and ledger distinction

Legacy school finance exports show a critical distinction that must exist in the product model:

- `payments` are not enough;
- the school also needs mixed financial reporting rows that include expenses, fees, transfers, and corrections.

Because of that, billing and reporting must separately support:

- `payments`
- `receivable_installments`
- `ledger_entries`
- `ledger_entry_allocations`
- `ledger_reporting_periods`

`payments` should represent real payment events.

`ledger_entries` should represent the broader accounting and reporting movements that appear in legacy weekly operational reports.

### 5.5 Documents domain

- `document_types`
- `document_records`
- `document_files`
- `document_access_log`

### 5.6 Audit domain

- `audit_log`
- `domain_events_outbox`

### 5.7 AI domain

- `ai_prediction_runs`
- `ai_prediction_results`
- `ai_chat_threads`
- `ai_chat_messages`
- `document_ocr_runs`
- `document_ocr_fields`
- `document_auto_fill_jobs`

## 6. Препоръчителен scheduling модел

Графикът е един от най-критичните домейни.

Препоръка:

`calendar_events`

Основни колони:

- `id`
- `tenant_id`
- `event_type`
- `status`
- `start_at`
- `end_at`
- `instructor_id`
- `vehicle_id`
- `student_id`
- `theory_group_id`
- `created_by`
- `updated_by`

### 6.1 Защо общ event слой

Това позволява:

- practically lessons;
- theory lectures;
- rest blocks;
- blocked time;
- unified schedule queries;
- по-добър календарен UI модел.

### 6.2 DB-level overlap protection

Критично правило:

- графичните конфликти не трябва да се пазят само в приложението.

Препоръка:

- `EXCLUDE USING gist` constraints;
- `tstzrange(start_at, end_at, '[)')`

Това трябва да се използва поне за:

- instructor overlap;
- vehicle overlap;
- student overlap, когато бизнес правилото го изисква.

## 7. Теория и присъствие

Препоръчителни таблици:

- `theory_groups`
- `theory_group_students`
- `theory_lectures`
- `theory_attendance`
- `theory_recovery_requirements`

`theory_attendance` трябва да пази:

- student;

## 15. Legacy register and finance fields discovered later

The legacy workbooks [register-silvi-ins.xlsx](/home/ad/Documents/work/Mind-on-road/docs/register-silvi-ins.xlsx) and [otchet-vili.xlsx](/home/ad/Documents/work/Mind-on-road/docs/otchet-vili.xlsx) revealed additional required structures.

They are reconciled in [legacy_school_data_reconciliation.md](/home/ad/Documents/work/Mind-on-road/docs/legacy_school_data_reconciliation.md), but the database consequence is explicit here.

### 15.1 Student enrollment and milestone fields

The product should explicitly support:

- `training_start_date`
- `training_group_code`
- `assigned_instructor_id`
- `course_outcome`
- `withdrawal_reason`
- `theory_completed_at`
- `theory_exam_at`
- `practical_completed_at`
- `practical_exam_at`
- `extra_hours_count`
- `extra_hours_unit_price`

These should not be squeezed into generic notes.

### 15.2 Student compliance and certification fields

The product should explicitly support:

- `national_id`
- `education_level`
- `birth_place_city`
- `birth_place_municipality`
- `birth_place_region`
- `address_text`
- `insurance_status`
- `record_mode`
- `training_diary_number`
- `protocol_number`
- `protocol_date`
- `certificate_issued_at`
- `cpo_completion_status`
- `theory_only_flag`
- `without_cpo_flag`

These fields matter for regulation, school administration, and evidence trails.

### 15.3 Reporting-ledger fields

The product should explicitly support financial rows with:

- `entry_type`
- `entry_classification`
- `counterparty_name`
- `document_reference`
- `original_currency`
- `original_amount`
- `base_currency_amount`
- `entry_note`
- `reporting_period_start`
- `reporting_period_end`

This structure is required because the legacy weekly reports mix:

- student payments;
- theory and practice fees;
- fuel and operational expenses;
- transfers and corrections;
- cash-box summaries.

This is broader than a simple payments table.
- lecture;
- attendance_status;
- marked_by;
- marked_at;
- auto_message_status;
- due_amount_minor при нужда;
- recovery_required.

## 8. Плащания и фактури

### 8.1 Плащания

`payments` трябва да пази:

- tenant_id
- student_id
- category_id
- amount_minor
- currency
- status
- payment_method
- due_at
- paid_at
- reason
- created_by
- updated_by

### 8.2 Фактури

`invoices` трябва да пази:

- tenant_id
- student_id
- invoice_number
- issued_at
- status
- total_minor
- currency
- created_by
- updated_by

### 8.3 Връзка между плащания и фактури

Не разчитай на implicit logic.

Използвай explicit link table:

- `payment_invoice_links`

Така остава проследимо:

- кое плащане към коя фактура е вързано;
- дали има partial matching;
- дали документът е коригиран.

## 9. Документи

Документите са чувствителни и трябва да са разделени на:

- business record;
- file metadata;
- file binary storage outside DB.

### 9.1 `document_records`

Съдържа:

- tenant_id
- owner_type
- owner_id
- document_type_id
- status
- valid_from
- valid_until
- notes

### 9.2 `document_files`

Съдържа:

- tenant_id
- document_record_id
- storage_key
- original_filename
- mime_type
- file_size
- checksum_sha256
- uploaded_by
- uploaded_at
- virus_scan_status

### 9.3 Достъп

Никога не съхранявай public URL като основен модел.

Правилният достъп е:

- backend authorization;
- кратко живеещ signed URL;
- access log.

### 9.4 OCR и document intelligence

OCR и document intelligence не трябва да презаписват директно основните данни без следа.

Нужни са отделни таблици:

- `document_ocr_runs` — един запис за всяка OCR обработка;
- `document_ocr_fields` — извлечени полета с стойност, confidence и normalized value;
- `document_auto_fill_jobs` — заявки за автоматично попълване на профил или документ;
- `document_field_confirmations` при нужда от human review.

Минимални полета за `document_ocr_runs`:

- tenant_id
- document_file_id
- source_document_type
- processing_status
- provider
- model
- started_at
- finished_at
- reviewed_by
- reviewed_at

Минимални полета за `document_ocr_fields`:

- tenant_id
- ocr_run_id
- field_name
- raw_value
- normalized_value
- confidence_score
- is_confirmed
- confirmed_by
- confirmed_at

## 10. Audit архитектура

Трябва да има append-only `audit_log` таблица за:

- плащания;
- фактури;
- документи;
- урок/график промени;
- теория и присъствие;
- административни коментари;
- login / session security events.

AI решенията също трябва да бъдат audit-ируеми:

- prediction generated;
- prediction accepted/rejected;
- OCR reviewed;
- auto-filled field confirmed/overridden;
- owner chat export or shared answer.

Минимални колони:

- `id`
- `tenant_id`
- `actor_user_id`
- `action`
- `entity_type`
- `entity_id`
- `before_json`
- `after_json`
- `request_id`
- `ip_address`
- `user_agent`
- `created_at`

## 11. Outbox pattern

За reliable integration и background jobs:

- използвай `domain_events_outbox`

Патернът е:

1. бизнес транзакцията записва домейн данни;
2. в същата транзакция записва outbox event;
3. worker process чете outbox и изпълнява side effects.

Това е правилно за:

- Viber съобщения;
- напомняния;
- известия;
- AI jobs;
- документални обработки.

## 11.1 AI persistence model

AI данните трябва да са структурирани, tenant-aware и разделени от основните оперативни таблици.

### `ai_prediction_runs`

- tenant_id
- prediction_type
- subject_type
- subject_id
- input_snapshot_json
- model
- provider
- provider_project
- status
- requested_by
- created_at

### `ai_prediction_results`

- tenant_id
- prediction_run_id
- score_numeric
- label
- explanation_text
- recommended_action
- confidence_score
- expires_at
- accepted_by
- accepted_at

### `ai_chat_threads`

- tenant_id
- created_by
- thread_type
- title
- created_at
- archived_at

### `ai_chat_messages`

- tenant_id
- thread_id
- role
- content
- source_refs_json
- model
- provider_project
- token_usage_in
- token_usage_out
- estimated_cost_minor
- created_at

### Правило за AI source of truth

AI таблиците не са source of truth за официалните бизнес факти.

Source of truth остават:

- student records;
- payments;
- invoices;
- schedules;
- document records.

### 11.2 Multi-tenant AI data isolation

Всички AI таблици трябва да са строго tenant-aware.

Това важи минимум за:

- `ai_prediction_runs`
- `ai_prediction_results`
- `ai_chat_threads`
- `ai_chat_messages`
- `document_ocr_runs`
- `document_ocr_fields`

Правила:

- всеки запис има `tenant_id`;
- lookup и index стратегията започват с `tenant_id`;
- AI chat history не се споделя между tenants;
- OCR extracted values не могат да се използват като глобален knowledge pool;
- ако бъде добавен retrieval / embeddings / AI context index, той също трябва да е с `tenant_id`;
- не се допуска shared customer-data training memory между различни школи.

Ако бъде добавен AI context store, той трябва да следва същите правила:

- `tenant_id`
- `source_type`
- `source_id`
- `context_payload`
- `created_at`
- `expires_at`

### 11.3 OpenAI usage metering модел

OpenAI provider usage tracking не трябва да бъде единствената истина за tenant-level consumption.

Правилният модел е:

- provider-level tracking в OpenAI project;
- tenant-level tracking в нашата база;
- usage reporting и budget controls по `tenant_id`.

Задължителни полета за AI usage отчетност:

- `tenant_id`
- `provider`
- `provider_project`
- `model`
- `feature_type`
- `token_usage_in`
- `token_usage_out`
- `estimated_cost_minor`
- `created_at`

Така системата може да следи:

- коя школа колко AI usage генерира;
- кой модул харчи най-много;
- budgets и soft/hard limits по tenant;
- разлика между provider-level usage и вътрешната tenant отчетност.

## 12. Индексиране

Индексите трябва да следват реалните query patterns.

Минимални важни индекси:

- `(tenant_id, status)`
- `(tenant_id, created_at desc)`
- `(tenant_id, student_id)`
- `(tenant_id, instructor_id, start_at)`
- `(tenant_id, valid_until)`
- `(tenant_id, invoice_number)`
- `(tenant_id, payment_status)`

За цел около 10 000 DAU трябва да се добави и дисциплина за:

- `(tenant_id, start_at)` за графици;
- `(tenant_id, updated_at desc)` за административни списъци;
- partial indexes за активни записи;
- отделни индекси за overdue / pending статуси;
- GIN/pg_trgm само върху реално използвани search-heavy полета.

## 12.1 Read scaling

За list-heavy и reporting-heavy сценарии архитектурата на базата трябва да допуска:

- PostgreSQL read replicas;
- read-only connection path за dashboard, справки и history screens;
- материализирани агрегати или refreshable summary tables за най-тежките KPI екрани.

Официалният write path остава само към primary базата.

За search-heavy полета:

- `GIN` върху `to_tsvector` или `pg_trgm` при нужда.

## 13. Миграции

Миграциите трябва да бъдат:

- versioned;
- deterministic;
- reviewed;
- reversible when practical.

Не разчитай на ad-hoc production changes.

### 13.1 Еволюция на големи таблици

При растящ multi-tenant SaaS трябва да има план за:

- online-safe migrations;
- backfill jobs на партиди;
- минимизиране на locking операции;
- възможно бъдещо partitioning на audit, notifications и OCR/AI history таблици по време.

## 14. Backups и recovery

Задължително:

- automated daily backups;
- point-in-time recovery;
- регулярни restore tests;
- отделна retention policy за object storage.

AI и OCR таблиците също трябва да влизат в backup стратегията, защото са част от operational traceability.

### 14.1 Hot table strategy за 10 000 DAU

Най-вероятните горещи таблици са:

- `calendar_events`
- `payments`
- `theory_attendance`
- `audit_log`
- `domain_events_outbox`
- `ai_chat_messages`

За тях трябва да има:

- строг индексен контрол;
- retention policy;
- възможност за time-based partitioning при нужда;
- read/write separation на ниво workload.

## 15. Окончателна database препоръка

Най-добрият модел за този продукт е:

- един PostgreSQL cluster;
- една primary database;
- shared schema multi-tenant model;
- силни foreign keys и constraints;
- generalized calendar event layer;
- integer money model;
- document metadata in DB + files in object storage;
- отделни AI/OCR таблици за predictions, owner chat и document extraction;
- read-replica readiness, tenant-first indexing и готовност за partitioning на hot history таблици;
- append-only audit log;
- outbox за reliable async processing.

Това е най-добрият баланс между:

- security;
- correctness;
- maintainability;
- SaaS readiness;
- ниска operational complexity.
