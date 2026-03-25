# KursantAI / DriveAdmin

## Технологичен стек

## 1. Цел на документа

Този документ описва препоръчителния технологичен стек за изграждане на продукта KursantAI / DriveAdmin.

Изборът е направен според:

- цел за около 10 000 дневно активни потребители;
- висока стойност на данните;
- силни изисквания за сигурност;
- нужда от бърза разработка;
- нужда от бъдеща multi-tenant SaaS еволюция.

## 2. Основен архитектурен избор

Препоръчителен стек:

- Frontend: `React`
- Backend API: `Node.js`
- Language: `TypeScript`
- Database: `PostgreSQL`
- Cache / coordination: `Redis`
- Storage: `S3-compatible object storage`
- Edge / reverse proxy: `Nginx`
- AI: `OpenAI API` + OCR/document extraction pipeline

## 3. Препоръчителен стек по слоеве

### 3.1 Frontend

- `React`
- `React`
- `TypeScript`
- `Vite`
- `react-router`
- `TanStack Query` за клиентски data fetching
- `Zustand` за global client state
- `React Hook Form` за форми
- `Zod` за runtime validation
- `Tailwind CSS` за UI implementation
- `Radix UI` като low-level primitives при нужда

Причини:

- excellent developer experience;
- бърз и лек frontend build pipeline;
- добра комбинация между client interactivity, routing и form-heavy admin workflows;
- добра интеграция с TypeScript;
- подходящо за административен продукт с богати таблици и форми.

### 3.1.1 Frontend state management стратегия

Препоръчителният модел не е един централен инструмент за всички видове state.

Правилният модел е:

- `TanStack Query` за `server state`
- `Zustand` за `global client state`
- `React Hook Form` за `form state`
- URL search params за filter/sort/navigation state
- локален React state за чисто локално UI поведение

Причини:

- `server state` и `client state` имат различна природа и не трябва да се смесват;
- admin SaaS с много таблици, форми и панели печели от по-лек client state слой;
- `Zustand` дава по-малко boilerplate от Redux и е достатъчно силен за този продукт;
- `TanStack Query` е по-подходящ от глобален store за cache, refetch, invalidation и async server data;
- `React Hook Form` е правилният слой за complex forms, а не глобален store.

### 3.2 Backend

Препоръка:

- `Node.js`
- `NestJS`
- `TypeScript`

Причини:

- NestJS дава ясна модулна структура;
- подходящ е за modular monolith;
- добре обслужва RBAC, validation, interceptors, jobs и clean layering;
- прави по-лесно архитектурното дисциплиниране на растящ продукт.

### 3.3 Data Access Layer

Препоръка:

- `node-postgres` като базов driver
- `Prisma ORM` за type-safe data access layer
- raw SQL за advanced PostgreSQL features

Причини:

- продуктът има нужда от силен PostgreSQL дизайн;
- ще са нужни advanced features като:
- exclusion constraints;
- partial indexes;
- check constraints;
- JSONB;
- range types;
- RLS;
- transactional SQL;
- Prisma дава по-добър developer experience, по-бърз onboarding и по-лесна стандартизация за екип, като при нужда могат да се добавят raw SQL заявки за performance-critical и PostgreSQL-specific случаи.

### 3.4 Authentication

Препоръка:

- custom server-side session architecture
- `argon2id` за password hashing
- HTTP-only secure cookies
- session records в PostgreSQL
- optional TOTP MFA за административни роли

Причини:

- web-first B2B продукт;
- по-добър контрол над revocation и сесии;
- по-малко complexity от stateless JWT everywhere;
- по-добър security posture за административен SaaS.

### 3.5 Background Jobs

Препоръка:

- `pg-boss` или сходен PostgreSQL-backed queue
- `Redis` за distributed locks и coordination

Причини:

- няма нужда от Kafka или RabbitMQ в ранния етап;
- намалява инфраструктурната сложност;
- достатъчно надеждно за:
- известия;
- автоматични напомняния;
- генерация на документи;
- outbox processing;
- AI tasks;
- retry workflows.

### 3.6 File and Document Storage

Препоръка:

- `Amazon S3` или `Cloudflare R2`
- `MinIO` за local development

Причини:

- правилен модел за чувствителни документи;
- лесно versioning / lifecycle;
- лесно signed URL access;
- по-добро управление от database blob storage.

### 3.6.1 Cache and Coordination

Препоръка:

- `Redis` като managed service

Използва се за:

- cache на dashboard агрегати;
- cache на tenant settings и permission snapshots;
- rate limiting;
- distributed locks за scheduler и worker-и;
- idempotency coordination за чувствителни async операции.

### 3.7 AI and Document Intelligence

Препоръка:

- `OpenAI API` за owner chat, extraction normalization и prediction assistance;
- OCR слой чрез model-based extraction pipeline;
- `JSON Schema` / structured outputs за стабилно извличане на полета;
- отделен AI service module в backend;
- asynchronous processing чрез `pg-boss`.

Покрива минимум:

- чат за собственика върху оперативни данни;
- prediction use cases;
- OCR на лични карти и шофьорски книжки;
- автоматично попълване на документи и профили след human review.

### 3.7.1 OpenAI project и usage стратегия

Препоръчителният operational модел е:

- един `OpenAI project` за production;
- отделни `OpenAI projects` за `dev` и `staging`;
- backend-only service credentials по среда;
- tenant-level metering и budget control вътре в нашата система.

Това означава:

- не се създава отделен OpenAI project за всяка автошкола по подразбиране;
- не се издава отделен OpenAI token за всеки tenant като стандартен модел;
- OpenAI project-ите се използват за environment-level separation;
- tenant usage tracking се реализира в нашата база чрез `tenant_id`.

Причини:

- по-малко operational complexity;
- по-лесен key rotation и secret management;
- по-чист onboarding на нови tenants;
- по-добър контрол върху billing и quotas в самия SaaS продукт;
- tenant isolation така или иначе трябва да се гарантира в backend и database слоя, не чрез provider project structure.

### 3.8 Validation

Препоръка:

- `Zod` за request/response validation
- DTO validation в backend
- shared schema definitions where practical

### 3.9 Observability

Препоръка:

- `Pino` за structured logs
- `Sentry` за error tracking
- `OpenTelemetry` за traces и основни метрики
- managed dashboards или лека Grafana интеграция в по-късен етап

Причини:

- не е нужна тежка self-hosted monitoring stack от ден 1;
- трябва бързо да се виждат грешки, performance проблеми и security аномалии.

За AI слоя трябва да се наблюдават и:

- latency по AI заявки;
- token/cost usage;
- extraction failure rate;
- confidence distribution;
- fallback rate към human review.

### 3.10 Edge и reverse proxy слой

Препоръка:

- `Nginx`

Причини:

- TLS termination;
- reverse proxy пред `React` приложението и `NestJS`;
- request size limits за document uploads;
- централизирано прилагане на security headers;
- базов request filtering и buffering control;
- по-добър контрол върху timeouts и upstream routing.

### 3.11 API Style

Препоръка:

- `GraphQL` за read/query слоя
- `REST` за command/upload/integration слоя
- OpenAPI documentation за REST частта
- schema-first дисциплина за GraphQL частта

Причини:

- сложните admin screens често изискват агрегирани данни от много модули;
- `GraphQL` е по-добър за rich read модели като dashboard, student profile, payments overview и theory group details;
- `REST` остава по-ясен за uploads, commands, webhooks и интеграционни действия;
- този хибриден модел дава по-добър frontend DX без да жертва operational clarity;
- подходящо е за административен продукт с много read-heavy екрани и чувствителни command операции.

#### Къде се използва `GraphQL`

- dashboard read модели;
- student profile overview;
- payments and invoices overview;
- schedule read модел;
- theory group details read модел;
- owner-facing summary and AI insight queries.

#### Къде се използва `REST`

- authentication и session flows;
- document upload/download;
- OCR start/review actions;
- create/update/cancel business commands;
- Viber and notification triggers;
- webhooks и външни интеграции.

## 4. Какво да не се използва в началото

Не препоръчвам от ден 1:

- необмислено разпадане в много microservices;
- Kafka;
- Kubernetes;
- Elasticsearch;
- отделни бази за всеки модул;
- event-sourcing като основен модел;
- complicated CQRS split без реална нужда;
- self-hosted ML инфраструктура;
- vector database без доказана нужда;
- отделен AI microservice още в първа версия.

Причина:

- ще увеличат сложността повече, отколкото стойността.

## 5. Препоръчителна production инфраструктура

Препоръчителен минимален production стек:

- `React app`
- `NestJS API`
- `Worker process`
- `Nginx`
- `Managed PostgreSQL`
- `Managed Redis`
- `S3-compatible storage`
- `Managed container hosting`
- `Sentry`
- AI provider credentials in secret manager

Подходящи варианти:

- Railway / Render / Fly.io за ранен етап
- AWS ECS / Fargate за по-сериозна production среда

## 6. Препоръчителна local development среда

- Docker Compose
- PostgreSQL
- Redis
- MinIO
- Mailhog или аналогична локална mail среда
- локален worker
- локален mock AI provider или sandbox AI credentials

## 7. Окончателна препоръка

Най-добрият стек за този продукт е:

- `React + Vite + TypeScript`
- `NestJS + Node.js + TypeScript`
- `PostgreSQL`
- `Redis`
- `Prisma ORM + targeted raw SQL`
- `PostgreSQL-backed jobs`
- `S3-compatible storage`
- `Nginx`
- `TanStack Query + Zustand + React Hook Form`
- `GraphQL for reads + REST for commands/uploads`
- `OpenAI API + structured OCR/extraction pipeline`
- `Pino + Sentry + OpenTelemetry`

### 7.1 Позиция за 10 000 DAU

При цел около 10 000 DAU най-добрият баланс не е "повече технологии", а "по-добра операционна дисциплина":

- `Nginx` като стабилен edge и reverse proxy слой;
- horizontal scaling на web и API инстанции;
- PostgreSQL primary + read replicas;
- Redis cache layer;
- async offloading за тежки document и AI задачи;
- строга query оптимизация и tenant-aware индекси;
- selective service extraction само при реален bottleneck.

Това е стекът с най-добър баланс между:

- сигурност;
- maintainability;
- speed of development;
- cost efficiency;
- readiness for future SaaS scaling.
