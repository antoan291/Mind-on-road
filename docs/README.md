# Карта на проектната документация

## Цел

Това е основната входна точка за документацията в repository-то.

Тази структура разделя ясно:

- продуктови и бизнес документи, които са source of truth;
- системна, data, security и backup архитектура;
- delivery и implementation playbooks;
- инструкции и знания за AI агента;
- сурови бизнес артефакти и legacy файлове.

## Препоръчителен ред за четене

1. [AGENTS.md](../AGENTS.md)
2. [agent/README.md](../agent/README.md)
3. [docs/product/strict_project_documentation.md](product/strict_project_documentation.md)
4. [docs/product/user_roles_matrix.md](product/user_roles_matrix.md)
5. [docs/product/business_plan.md](product/business_plan.md)
6. [docs/architecture/system_architecture.md](architecture/system_architecture.md)
7. [docs/architecture/tech_stack_architecture.md](architecture/tech_stack_architecture.md)
8. [docs/architecture/database_architecture.md](architecture/database_architecture.md)
9. [docs/architecture/security_architecture.md](architecture/security_architecture.md)
10. [docs/delivery/development_execution_playbook.md](delivery/development_execution_playbook.md)

## Структура на `docs/`

### `docs/product/`

Продуктов обхват, бизнес логика, ролеви модел и platform-level функционални правила.

### `docs/architecture/`

Системна архитектура, технологичен стек, база данни, security, backup/restore и legacy data reconciliation.

### `docs/automation/`

Стратегия за автоматизация и регулаторно/пазарно проучване за automation roadmap.

### `docs/delivery/`

Playbooks, стандарти и ред за разработка на frontend/backend, плюс AI-assisted design prompts.

### `docs/artifacts/`

Сурови Excel/PPTX файлове, презентации и legacy отчетни артефакти.

### `agent/`

Reusable инструкции, playbooks, subagent orchestration, research notes, source registry и engineering lessons за Codex.

## Основни source-of-truth документи

- [strict_project_documentation.md](product/strict_project_documentation.md) - продуктов обхват и бизнес правила.
- [user_roles_matrix.md](product/user_roles_matrix.md) - роли, права и tenant граници.
- [business_plan.md](product/business_plan.md) - бизнес модел, roadmap и commercial посока.
- [platform_admin_feature_management.md](product/platform_admin_feature_management.md) - feature flags/licensing поведение по tenant.
- [system_architecture.md](architecture/system_architecture.md) - high-level системен дизайн.
- [tech_stack_architecture.md](architecture/tech_stack_architecture.md) - технологичен стек и инженерни аргументи.
- [database_architecture.md](architecture/database_architecture.md) - data model и multi-tenant data стратегия.
- [security_architecture.md](architecture/security_architecture.md) - security модел и sensitive-data контрол.
- [backup_and_disaster_recovery.md](architecture/backup_and_disaster_recovery.md) - backup, restore и disaster recovery стратегия.
- [legacy_school_data_reconciliation.md](architecture/legacy_school_data_reconciliation.md) - връзка между legacy workbook данните и target domain модела.
- [automation_strategy.md](automation/automation_strategy.md) - automation модел и workflows.
- [automation_research_and_regulatory_notes.md](automation/automation_research_and_regulatory_notes.md) - регулаторно и market research за автоматизационния обхват.
- [development_execution_playbook.md](delivery/development_execution_playbook.md) - ред за имплементация и delivery процес.
- [design_prompts.md](delivery/design_prompts.md) - AI-assisted design prompts и UI насоки.

## Правила за поддръжка

- Не смесвай product truth и implementation guidance с agent operating instructions.
- Нови agent workflow-и и правила се добавят в `agent/`, а кратката always-on част се синтезира в `AGENTS.md`.
- Markdown линковете в `docs/` трябва да са repo-relative и преносими.
- Не дублирай бизнес правила в много файлове; избирай един source of truth и линквай към него.
- Сурови Excel/PPTX/изображения се държат в `docs/artifacts/`, а не до markdown спецификации.
