# KursantAI / DriveAdmin

## Индекс на архитектурата и source of truth

## 1. Цел на документа

Този документ е централната входна точка към архитектурната и продуктовата документация на проекта.

Целта му е:

- да показва кои документи съществуват;
- да обяснява за какво служи всеки от тях;
- да описва кои решения вече са фиксирани;
- да дава ясен ред за четене;
- да служи като `source of truth map` за целия проект.

Този файл трябва да може да бъде прочетен и разбран от:

- клиент;
- project owner;
- team lead;
- senior engineer;
- software architect.

## 2. Как трябва да се чете документацията

Документацията не трябва да се възприема като произволен набор от бележки.

Тя е организирана като система от свързани документи:

- продуктов документ;
- системна архитектура;
- технологичен стек;
- база данни;
- сигурност;
- backups и disaster recovery;
- дизайн насоки и AI prompts.

Всеки документ има отделна роля, но всички заедно описват едно и също решение.

Препоръчителният логически ред на самите файлове е:

1. продуктов документ;
2. матрица на ролите и правата;
3. системна архитектура;
4. технологичен стек;
5. база данни;
6. сигурност;
7. backup и disaster recovery;
8. дизайн и AI prompts.

## 3. Основни документи

### 3.1 Продуктова и бизнес логика

- [strict_project_documentation.md](C:/AD/work/My%20company/school/docs/strict_project_documentation.md)

Това е основният продуктов документ.

Той описва:

- какво представлява системата;
- кои са основните модули;
- какви са ролите;
- какви са бизнес правилата;
- кои функционалности влизат във Version 1;
- как AI участва в продукта;
- какви са критериите за приемане.

Това е основният `source of truth` за продуктово поведение и бизнес правила.

### 3.2 Дизайн система и Stitch/Figma AI prompts

- [designer-promps.md](C:/AD/work/My%20company/school/docs/designer-promps.md)

Този документ описва:

- общата визуална посока;
- `Obsidian Navigator` темата;
- UX принципите;
- design consistency правилата;
- page-by-page prompts за Stitch / Figma AI;
- anti-drift инструкции за поддържане на единна система.

Това е основният `source of truth` за AI-assisted дизайн посоката.

### 3.2.1 Матрица на ролите и правата

- [user_roles_matrix.md](C:/AD/work/My%20company/school/docs/user_roles_matrix.md)

Този документ описва:

- ролите в системата;
- достъпите по модули;
- tenant scope на правата;
- обратната връзка след урок;
- границите между администратор, администрация, инструктор и ученик.

Това е основният `source of truth` за ролевия модел и достъпите на потребителите.

### 3.3 Системна архитектура

- [system_architecture.md](C:/AD/work/My%20company/school/docs/system_architecture.md)

Този документ описва:

- high-level архитектурата;
- логическите компоненти;
- модела на multi-tenant SaaS системата;
- background processing;
- AI services layer;
- caching и read scaling посоката;
- еволюцията към около `10 000` дневно активни потребители.

Това е основният `source of truth` за high-level архитектурната посока.

### 3.4 Технологичен стек

- [tech_stack_architecture.md](C:/AD/work/My%20company/school/docs/tech_stack_architecture.md)

Този документ описва:

- избраните технологии;
- защо са избрани;
- слоевете на стека;
- backend, frontend, database, cache, storage, AI и observability компонентите;
- production-ready посоката на deployment.

Това е основният `source of truth` за технологичния избор.

### 3.5 Архитектура на базата данни

- [database_architecture.md](C:/AD/work/My%20company/school/docs/database_architecture.md)

Този документ описва:

- database модела;
- multi-tenant структурата;
- `tenant_id` дисциплината;
- индексна стратегия;
- hot table стратегия;
- read scaling посока;
- AI и OCR данните в базата;
- изискванията за consistency и traceability.

Това е основният `source of truth` за database архитектурата.

### 3.6 Архитектура на сигурността

- [security_architecture.md](C:/AD/work/My%20company/school/docs/security_architecture.md)

Този документ описва:

- authentication и authorization модела;
- tenant isolation;
- document security;
- AI/OCR security controls;
- rate limits, quotas и anomaly detection;
- security posture за multi-tenant SaaS при около `10 000 DAU`.

Това е основният `source of truth` за security модела.

### 3.7 Backup и disaster recovery

- [backup_and_disaster_recovery.md](C:/AD/work/My%20company/school/docs/backup_and_disaster_recovery.md)

Този документ описва:

- backup слоевете;
- PostgreSQL PITR стратегията;
- document protection с versioning и Object Lock;
- offsite слоя;
- локалния emergency backup на админ лаптоп;
- restore playbooks;
- monitoring и verification.

Това е основният `source of truth` за backup и recovery архитектурата.

## 4. Фиксирани решения към момента

Следните решения вече трябва да се считат за фиксирани, освен ако няма изрично архитектурно решение за промяна:

- продуктът е multi-tenant SaaS;
- целевата посока е около `10 000` дневно активни потребители;
- архитектурният модел е `scale-ready modular monolith`;
- frontend стекът е `React + Vite`;
- frontend state стратегията е `TanStack Query + Zustand + React Hook Form`;
- backend посоката е `Node.js` с `NestJS`;
- базата е `PostgreSQL`;
- ORM слоят е `Prisma`;
- cache и distributed coordination слоят е `Redis`;
- edge и reverse proxy слоят е `Nginx`;
- API стратегията е `GraphQL for reads + REST for commands/uploads/integrations`;
- файловете и документите се пазят в `S3-compatible object storage`;
- има AI слой за predictions, OCR и owner chat;
- AI е `tenant-scoped` и не използва shared customer-data training между различни школи;
- OpenAI usage моделът е `single project per environment + tenant metering in our system`;
- сигурността е `tenant-aware` и `document-first`;
- backup стратегията включва `PITR`, `Object Lock`, `offsite copy` и `local emergency copy`.

## 5. Архитектурни принципи, които не трябва да се нарушават

Независимо от бъдещи промени, следните принципи трябва да останат валидни:

- една истина за критичните данни;
- силна tenant изолация;
- security by default;
- auditability на критичните действия;
- AI не презаписва чувствителни официални данни без контрол;
- documents не се третират като обикновени файлове;
- backups без restore тестове не се считат за достатъчни;
- не се преминава към microservices без реална operational причина.

## 6. Препоръчителен ред за четене

За клиент или owner:

1. [strict_project_documentation.md](C:/AD/work/My%20company/school/docs/strict_project_documentation.md)
2. [user_roles_matrix.md](C:/AD/work/My%20company/school/docs/user_roles_matrix.md)
3. [designer-promps.md](C:/AD/work/My%20company/school/docs/designer-promps.md)
4. [backup_and_disaster_recovery.md](C:/AD/work/My%20company/school/docs/backup_and_disaster_recovery.md)

За engineer или team lead:

1. [strict_project_documentation.md](C:/AD/work/My%20company/school/docs/strict_project_documentation.md)
2. [user_roles_matrix.md](C:/AD/work/My%20company/school/docs/user_roles_matrix.md)
3. [system_architecture.md](C:/AD/work/My%20company/school/docs/system_architecture.md)
4. [tech_stack_architecture.md](C:/AD/work/My%20company/school/docs/tech_stack_architecture.md)
5. [database_architecture.md](C:/AD/work/My%20company/school/docs/database_architecture.md)
6. [security_architecture.md](C:/AD/work/My%20company/school/docs/security_architecture.md)
7. [backup_and_disaster_recovery.md](C:/AD/work/My%20company/school/docs/backup_and_disaster_recovery.md)

За архитект:

1. [strict_project_documentation.md](C:/AD/work/My%20company/school/docs/strict_project_documentation.md)
2. [user_roles_matrix.md](C:/AD/work/My%20company/school/docs/user_roles_matrix.md)
3. [system_architecture.md](C:/AD/work/My%20company/school/docs/system_architecture.md)
4. [database_architecture.md](C:/AD/work/My%20company/school/docs/database_architecture.md)
5. [security_architecture.md](C:/AD/work/My%20company/school/docs/security_architecture.md)
6. [tech_stack_architecture.md](C:/AD/work/My%20company/school/docs/tech_stack_architecture.md)
7. [backup_and_disaster_recovery.md](C:/AD/work/My%20company/school/docs/backup_and_disaster_recovery.md)

## 7. Как да се поддържа тази документация

При нови решения трябва да се спазва следното:

- бизнес промяна се записва първо в продуктовия документ;
- архитектурна промяна се отразява в системната архитектура;
- промяна в технологичен избор се отразява в технологичния стек;
- промяна в schema, tenancy, indexing или data access логика се отразява в database архитектурата;
- security промяна се отразява в security архитектурата;
- backup или recovery промяна се отразява в backup документа;
- UI/UX и Stitch/Figma prompt промяна се отразява в design документа.

## 8. Правило за консистентност

Не трябва да има противоречащи си решения между документите.

Ако дадено решение се промени, трябва да се провери поне в:

- продуктовия документ;
- системната архитектура;
- технологичния стек;
- database архитектурата;
- security архитектурата;
- backup архитектурата;
- design prompt документа.

## 9. Какво още липсва в бъдеще

Следващи полезни документи, които могат да бъдат добавени:

- `database_schema_blueprint.md`
- `api_architecture.md`
- `domain_modules_blueprint.md`
- `implementation_roadmap.md`
- `observability_runbook.md`
- `tenant_onboarding_offboarding.md`
- `ai_architecture_blueprint.md`

## 10. Окончателна роля на този документ

Този документ не замества останалите.

Неговата роля е:

- да бъде входната карта към цялата архитектура;
- да показва кое къде се намира;
- да държи фиксираните решения видими;
- да помага нов човек да влезе в проекта бързо;
- да пази документацията като една система, а не като отделни notes.

## Platform Admin Feature Management

- [platform_admin_feature_management.md](C:/AD/work/My%20company/school/docs/platform_admin_feature_management.md)

Този документ е source of truth за управлението на платени модули, feature flags и platform admin контрол върху това кои функционалности са активни за всяка отделна школа.
