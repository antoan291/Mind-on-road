# Backend стандарти

## 1. Цел

Това са backend правилата за имплементация в проекта.

Те съществуват, за да държат backend-а:

- модулен;
- сигурен;
- експлицитен;
- auditable;
- maintainable.

## 2. Правила за стека

- Runtime: `Node.js`
- Transport layer: `Express`
- Language: `TypeScript`
- Database access: `Prisma`
- Database: `PostgreSQL`
- Background processing: application jobs върху modular monolith-а
- API стил: `GraphQL` за read-heavy query use cases, `REST` за commands и uploads

## 3. Архитектурни правила

- Дръж системата като modular monolith, докато измерими аргументи не оправдаят по-нататъшно разпределяне.
- Разделяй по business modules.
- Дръж transport concerns отделени от business logic.
- Дръж module boundaries експлицитни.
- Не въвеждай абстракции без реална полза.

## 4. Правила за модулите

Всеки модул трябва да има ясно място за:

- transport или presentation;
- application services и use cases;
- domain rules;
- infrastructure или persistence;
- tests.

Файловете трябва да се именуват по use case и поведение, не с generic labels.

## 5. API правила

- Използвай REST за commands, uploads и workflow actions.
- Използвай GraphQL за read-heavy aggregate screens.
- Валидирай inputs рано.
- Дръж handlers тънки.
- Връщай консистентни error shapes.
- Прави authorization експлицитна на boundary слоя.

## 6. Data правила

- PostgreSQL е source of truth.
- Моделирай всяка tenant-owned таблица с `tenant_id`.
- Използвай minor units за пари.
- Използвай UTC timestamps.
- Използвай constraints целенасочено.
- Дръж file binaries извън relational базата; metadata остава в PostgreSQL.

## 7. Security правила

- Authorization трябва да е tenant-aware на всеки sensitive path.
- Никога не разчитай само на frontend hiding.
- Логвай security-sensitive и financial actions.
- Дръж secrets само в backend.
- Третирай document/OCR/AI workflows като sensitive.

## 8. Operational правила

- Централизирай configuration.
- Централизирай error handling.
- Използвай structured logging.
- Дръж health и operational visibility като first-class concern.
- Проектирай jobs и retries да са idempotent.

## 9. Testing правила

- Тествай core business rules.
- Тествай критичната finance и permissions логика.
- Тествай file/document handling flows.
- Тествай error cases, не само happy paths.

## 10. Definition of Done

Backend feature не е готов само защото endpoint-ът е отговорил веднъж.

Готов е, когато:

- бизнес правилото е ясно;
- има validation;
- authorization е коректна;
- persistence е коректна;
- auditability е покрита там, където е нужно;
- важните failures са обработени;
- shape-ът е готов за frontend consumption.
