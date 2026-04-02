# Backend

Това е backend skeleton за проекта, подреден като Node.js modular monolith с ясни bounded context-и и стриктни layer правила.

## Архитектурна посока

- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- Redis за cache, coordination и rate limiting
- GraphQL за read API
- REST за command, upload и integration flows
- shared-schema multi-tenant модел с `tenant_id`
- Nginx пред backend слоя
- OpenAI, OCR и prediction flows като отделен `ai` bounded context

## Папки на root ниво

- `src/modules` - bounded contexts по бизнес домейни
- `src/common` - shared building blocks без конкретна домейн логика
- `src/infrastructure` - технически адаптери и provider integrations
- `src/config` - environment и application configuration
- `src/bootstrap` - startup extensions за HTTP, GraphQL и Swagger
- `src/jobs` - outbox, schedulers и worker entry points
- `prisma` - schema, migrations и database bootstrapping
- `test` - unit, integration и e2e test layout

## Най-важни backend стандарти

- Всеки модул има `application`, `domain`, `infrastructure` и `presentation` слой.
- Controllers и resolvers са тънки; business orchestration живее в `application`.
- Domain layer не знае за Express, Prisma, Redis, OpenAI или HTTP.
- Достъпът до tenant данни е задължително tenant-aware и deny-by-default.
- Sensitive flows имат audit следа и ясни boundaries.
- Не се допуска giant файл, giant service или хаотично прескачане между модули.

## Основни модулни контексти

- identity
- tenancy
- platform-admin
- students
- instructors
- vehicles
- scheduling
- theory
- practice
- payments
- invoicing
- documents
- notifications
- reporting
- audit
- ai

## Задължителни справочни файлове

- `backend/STRUCTURE_GUIDE.md` - къде живее всяка отговорност
- `backend/NAMING_CONVENTIONS.md` - правила за имена на файлове, класове и DTO-та
- `backend/MODULE_TEMPLATE.md` - стандарт при създаване на нов модул
- `core/research/backend_architecture_standards.md` - общият backend source of truth

## Работен принцип

Преди да се добавя нова функционалност:

1. Избира се правилният bounded context.
2. Решава се дали е command flow, query flow, background job или integration.
3. Кодът се поставя в правилния layer, а не в най-близкия удобен файл.
4. Ако структурата се променя, промяната се записва в `core/logs/version_journal.md`.

## Local Docker stack

За локално backend тестване проектът поддържа Docker Compose stack в [docker-compose.yml](/home/ad/Documents/work/Mind-on-road/backend/docker-compose.yml), който вече стартира и самия backend контейнер.

Услуги:

- `backend` на `localhost:3001`
- `postgres` на `localhost:5433`
- `redis` на `localhost:6379`
- `minio` на `localhost:9000`
- `minio console` на `localhost:9001`

Старт:

```bash
cd backend
cp .env.example .env
docker compose up -d
```

Compose автоматично свързва backend контейнера към вътрешните Docker hostnames:

- `postgres`
- `redis`
- `minio`

Спиране:

```bash
cd backend
docker compose down
```

Ребилд след промени по backend кода:

```bash
cd backend
docker compose up -d --build backend
```

В `.env.example` са зададени локалните credentials за хост машина. PostgreSQL е публикуван на `localhost:5433`, за да не конфликтира с вече зает `5432` порт. При Docker Compose `DATABASE_URL`, `DIRECT_DATABASE_URL`, `REDIS_URL` и `OBJECT_STORAGE_ENDPOINT` се override-ват автоматично с вътрешните service hostnames. За реална работа създай `.env` от `.env.example` и коригирай секретите при нужда.
