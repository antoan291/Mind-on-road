# Frontend delivery план

## 1. Цел

Този документ описва правилния ред за frontend имплементация.

Проектът вече има визуален frontend prototype. Задачата сега е той да се превърне в стабилен, contract-driven frontend без хаос.

## 2. Правилен ред

### Стъпка 1: стабилизирай съществуващия prototype

- махни broken text и visual regressions;
- премахни inconsistent UI patterns;
- стандартизирай dialogs, drawers, tables и cards;
- направи всички ключови pages demo-safe.

### Стъпка 2: централизирай static content

- премести повторяемите labels и UI copy в shared content files;
- дръж page-specific content структуриран, не разхвърлян.

### Стъпка 3: централизирай mock business data

- премести students, payments, invoices и documents в mock-db файлове;
- направи shape-а достатъчно реалистичен, за да огледално отразява бъдещото API.

### Стъпка 4: дефинирай frontend contracts

За всеки основен модул дефинирай:

- list view shape;
- detail view shape;
- create payload;
- edit payload;
- filtering shape;
- status enums.

### Стъпка 5: разделяй големите pages

- разделяй oversized pages на local feature components;
- дръж route-level orchestration четим;
- мести повторяеми UI patterns в reusable components само когато реално са shared.

### Стъпка 6: подготви интеграцията с реално API

- дефинирай query keys и mutation boundaries;
- раздели fetch logic от rendering logic;
- идентифицирай къде TanStack Query ще притежава data flow-а.

### Стъпка 7: свързвай модул по модул

Препоръчителен ред:

1. students
2. payments
3. invoices
4. documents
5. theory
6. practice
7. instructors
8. vehicles
9. reporting
10. AI center

### Стъпка 8: добави тестове за критичните flows

Първо тествай flows, при които regression е скъп:

- student create/edit;
- payment registration;
- invoice creation;
- document upload/review;
- theory attendance save;
- practical lesson editing.

## 3. Per-feature execution checklist

За всеки frontend feature:

1. провери docs;
2. потвърди business rule-а;
3. потвърди UI states;
4. потвърди data shape-а;
5. имплементирай UI чисто;
6. вържи реалистично mock data;
7. направи го reusable, когато има смисъл;
8. остави го готово за backend integration.

## 4. Основни anti-patterns

Не прави:

- вечни giant page files;
- разхвърляни labels и data по много pages;
- нов UI pattern за всеки feature;
- fake logic, която после не може да се map-не към реален backend;
- смесване на domain data, layout и modal logic в един файл без boundaries.
