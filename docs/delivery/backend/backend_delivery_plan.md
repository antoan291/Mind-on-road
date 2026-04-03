# Backend delivery план

## 1. Цел

Този документ описва правилния ред за изграждане на backend-а.

Backend-ът не трябва да се строи като случаен набор от endpoints. Той трябва да се изгражда на слоеве и по vertical slices.

## 2. Правилен ред

### Стъпка 1: стабилизирай границите

Преди да се добавят много routes:

- потвърди продуктовите правила;
- потвърди role/permission модела;
- потвърди module boundaries;
- потвърди frontend contracts за първите модули.

### Стъпка 2: финализирай core data modeling

Първо се фокусирай върху:

- tenants;
- users and roles;
- students;
- payments;
- invoices;
- documents;
- theory attendance;
- practical lessons.

### Стъпка 3: изгради backend основата

Създай и стабилизирай:

- app bootstrap;
- config loading;
- logger;
- error handling;
- auth skeleton;
- authorization policy structure;
- Prisma client integration;
- storage abstraction;
- audit logging basics.

### Стъпка 4: изграждай vertical slices

Препоръчителен ред:

1. identity
2. tenancy
3. platform-admin
4. students
5. payments
6. invoicing
7. documents
8. theory
9. practice
10. instructors
11. vehicles
12. notifications
13. reporting
14. AI

За всеки slice:

- schema support;
- create/edit/detail/list behavior;
- validation;
- authorization;
- audit там, където е нужно;
- frontend contract support.

### Стъпка 5: добави jobs и automation

Само след като data model-ът и core flows са надеждни:

- reminders;
- expiry checks;
- risk scoring;
- OCR processing;
- reporting jobs;
- owner/admin summaries.

### Стъпка 6: добави external integrations

Накрая, и само с контролирани boundaries:

- NRA/NAP-related adapters;
- IAAA/DAI support flows;
- notification providers;
- storage providers;
- accounting integrations.

## 3. Per-feature backend checklist

За всеки backend feature:

1. потвърди продуктовото правило;
2. потвърди contract-а;
3. потвърди data model impact-а;
4. имплементирай validation;
5. имплементирай authorization;
6. имплементирай persistence;
7. имплементирай response shape-а;
8. имплементирай auditability, ако е нужно;
9. имплементирай тестове за ключовата логика.

## 4. Основни anti-patterns

Не прави:

- handlers първо и модел после;
- смесване на transport logic с domain logic;
- пропускане на auditability при sensitive flows;
- прекалено ранно over-generalization;
- integrations преди internal workflows да са стабилни.
