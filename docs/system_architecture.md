# KursantAI / DriveAdmin

## Системна архитектура

## 1. Цел на документа

Този документ описва препоръчителната системна архитектура на продукта KursantAI / DriveAdmin като SaaS платформа за автошколи.

Архитектурните решения са съобразени с:

- бизнес домейна на продукта;
- цел за мащабиране към около 10 000 дневно активни потребители;
- изискване за висока сигурност;
- съхранение на чувствителни документи;
- бъдеща продажба на продукта към повече от една автошкола;
- необходимост от проста, стабилна и поддържаема архитектура.

## 2. Архитектурна позиция

За този продукт препоръчителната архитектура не е микроуслугова.

Правилният избор е:

- модулен монолит;
- една основна backend система;
- една основна PostgreSQL база;
- отделно обектно хранилище за файлове и документи;
- фонови задачи и асинхронни процеси, управлявани централизирано.

Причини:

- продуктът е B2B и товарът е предвидим, но вече трябва да се проектира за около 10 000 DAU;
- домейнът е административен, а не real-time consumer at scale;
- сигурността, консистентността и проследимостта са по-важни от хоризонталното разпадане на системата;
- екипът ще печели повече от простота и яснота, отколкото от ранна дистрибуция на системата.

## 3. Архитектурни принципи

Системата трябва да следва следните принципи:

- една истина за данните;
- ясни домейн граници вътре в монолита;
- силна транзакционна консистентност за критични операции;
- защита на ниво приложение и на ниво база;
- append-only проследимост за критични промени;
- минимален инфраструктурен шум в ранния етап;
- лесна еволюция към по-сложен multi-tenant SaaS модел.

## 4. Препоръчителен high-level модел

### 4.1 Основни компоненти

Продуктът следва да се състои от:

- `Edge / Reverse Proxy Layer` — `Nginx` пред приложението за TLS termination, request filtering, request size limits и reverse proxy контрол;
- `Web App` — Next.js приложение за администрация, портал за ученици и бъдещ клиентски достъп;
- `API App` — Node.js backend като модулен монолит;
- `Primary Database` — PostgreSQL;
- `Cache Layer` — Redis за краткоживеещ cache, rate limiting и distributed coordination;
- `Object Storage` — S3-съвместимо хранилище за документи;
- `Background Jobs Worker` — фонов обработчик за известия, напомняния, генерация на документи и автоматизации;
- `AI Services Layer` — AI оркестрация за прогнози, чат за собственика и OCR извличане от документи;
- `Observability Layer` — логове, трасета, грешки, метрики;
- `Identity and Access Layer` — автентикация, сесии, роли, tenant контекст.

### 4.2 Логически поток

Основният логически поток е:

1. Потребителят отваря приложението.
2. `Nginx` приема трафика, прилага базови edge security правила и го маршрутизира към приложението.
3. Приложението валидира сесията и tenant контекста.
4. Заявките към домейн логиката минават през Node.js API слоя.
5. API слоят изпълнява бизнес правила и транзакции в PostgreSQL.
6. Документите се съхраняват в object storage, а metadata остава в PostgreSQL.
7. OCR и AI обработките се изпълняват асинхронно чрез AI services layer и worker процеси.
8. Асинхронните действия се изпълняват чрез background jobs и reliable outbox pattern.

## 5. Защо не microservices

Следните причини правят microservices грешен избор в този етап:

- ненужна оперативна сложност;
- по-трудно дебъгване;
- разпадане на транзакционна цялост;
- по-трудно гарантиране на консистентност при плащания, фактури, графици и документи;
- по-голяма цена за инфраструктура и наблюдение;
- по-висок риск от архитектурен шум без бизнес стойност.

Правилното решение е вътрешна модулност, а не ранна физическа дистрибуция.

## 6. Препоръчани вътрешни домейн модули

Модулният монолит трябва да е разделен логически поне на следните bounded contexts:

- `identity`
- `tenancy`
- `students`
- `instructors`
- `vehicles`
- `scheduling`
- `theory`
- `payments`
- `invoicing`
- `documents`
- `notifications`
- `reporting`
- `audit`
- `ai`

Всеки модул трябва да има:

- собствен domain layer;
- собствен application layer;
- ясно дефинирани входни точки;
- забрана за директен хаотичен достъп до чужда логика.

### 6.1 AI като отделен bounded context

AI модулът не трябва да бъде третиран като помощна интеграция, а като самостоятелен bounded context.

Той трябва да покрива минимум:

- `predictions` — прогнози за риск от отпадане, просрочени плащания, нужда от допълнителни часове и административни пропуски;
- `assistant` — чат за собственика и администраторите, който отговаря върху реални tenant данни;
- `document-intelligence` — OCR и структурирано извличане от лични карти, шофьорски книжки и други качени документи;
- `ai-audit` — пълна проследимост на prompt, модел, входен контекст, резултат и човешко потвърждение.

### 6.2 Multi-tenant AI isolation модел

AI не трябва да бъде "обучаван" върху смесени production данни на всички автошколи.

Правилният модел е:

- споделена AI инфраструктура;
- строго `tenant-scoped context`;
- retrieval и tool access само в рамките на текущия `tenant_id`;
- никакъв direct cross-tenant data access;
- никаква shared customer-data memory между школи.

Това означава:

- backend слоят първо филтрира и разрешава данните;
- AI получава само вече разрешения tenant context;
- AI няма директен достъп до цялата база;
- AI няма право сам да "обикаля" между данните на различни школи;
- customer данните не се използват като общ training corpus между tenants.

Ако в бъдеще се добави retrieval слой или knowledge index, всеки запис в него трябва да бъде tenant-scoped и retrieval заявките задължително да филтрират по `tenant_id`.

### 6.3 AI provider tenancy и usage контрол

OpenAI provider слоят не трябва да се моделира с отделен project за всяка школа като стандартна стратегия.

Препоръчителният модел е:

- един production provider project;
- environment-level separation за `dev`, `staging` и `production`;
- backend-only service credentials;
- tenant-level metering, quota и budget control вътре в SaaS платформата.

Това позволява:

- по-чист operational модел;
- централизирано secret management;
- ясна вътрешна отчетност по `tenant_id`;
- възможност за бъдещи enterprise exceptions само при реална нужда.

## 7. Препоръчителна структура на backend приложението

Примерна структура:

```text
apps/
  web/
  api/
packages/
  ui/
  config/
  types/
  auth/
  shared/
```

Вътре в `apps/api`:

```text
src/
  modules/
    identity/
    tenancy/
    students/
    instructors/
    vehicles/
    scheduling/
    theory/
    payments/
    invoicing/
    documents/
    notifications/
    reporting/
    audit/
    ai/
  infrastructure/
  database/
  jobs/
  common/
```

## 8. Multi-tenant SaaS стратегия

Продуктът трябва да бъде проектиран като multi-tenant от ден 1.

Препоръчителният модел е:

- shared database;
- shared schema;
- tenant isolation чрез `tenant_id` във всички tenant-owned таблици;
- допълнителна защита чрез PostgreSQL Row Level Security за чувствителни таблици;
- tenant-aware application services и repositories.

### 8.1 Защо shared schema + tenant_id

Това е най-добрият баланс между:

- ниска оперативна сложност;
- добра цена;
- бързо развитие;
- възможност за бъдещо мащабиране;
- лесен onboarding на нови школи.

При цел около 10 000 DAU този модел остава правилен, ако се добавят:

- строга tenant-aware индексация;
- read replicas за отчетни и list-heavy заявки;
- cache за често четени справки и dashboard агрегати;
- възможност за по-късно tenant tiering към dedicated database за най-големите клиенти.

### 8.2 Бъдеща еволюция

Архитектурата трябва да оставя път към:

- отделна база за VIP tenant;
- отделен storage bucket policy per tenant;
- логическа или физическа изолация при enterprise договори;
- отделен AI provider routing policy per tenant;
- по-късно изнасяне на AI worker-а като самостоятелна услуга, ако натоварването или регулаторните изисквания го наложат.

## 9. Асинхронна архитектура

Не е необходимо Kafka или сложен брокер в ранния етап.

Препоръчителният подход е:

- транзакционен outbox;
- PostgreSQL-backed jobs;
- отделен worker process;
- Redis за distributed locks, burst control и coordination между worker инстанции.

Това е достатъчно за:

- Viber известия;
- напомняния;
- автоматични сигнали;
- генерация на документи;
- проверка на качени файлове;
- AI обработка;
- седмични отчети.

### 9.1 AI execution model

AI обработката трябва да следва контролиран поток:

1. Оперативните данни се записват първо в PostgreSQL.
2. Събитие или заявка създава job към AI слоя.
3. Worker извлича само tenant-scoped контекст.
4. AI услугата генерира prediction, OCR extraction или chat response.
5. Резултатът се записва като структуриран AI record.
6. Ако резултатът влияе на бизнес процес, той се маркира като suggestion, draft или warning, а не като невалидируемо крайно решение.

## 10. Документи и файлове

Документите не трябва да се съхраняват в самата база като binary blob, освен при много специален случай.

Правилният модел е:

- файлът в object storage;
- metadata в PostgreSQL;
- достъп само чрез backend;
- подписани временни URL адреси;
- антивирусна проверка;
- audit trail за достъп и промени.

### 10.1 Document intelligence architecture

Архитектурата на документите трябва да поддържа и AI/OCR обработка:

- качване на оригиналния файл в private object storage;
- OCR pipeline за извличане на име, номер на документ, дата на издаване, валидност и други структурирани полета;
- confidence score за всяко извлечено поле;
- human review стъпка преди автоматично записване в официалните данни на курсиста;
- повторна обработка при подменен файл или подобрен extraction модел.

## 11. Транзакционен модел

Критичните бизнес операции трябва да остават силно транзакционни:

- плащане;
- фактура;
- промяна на график;
- създаване на урок;
- отбелязване на присъствие;
- промяна на документален статус;
- издаване на административни записи.

Това е една от основните причини системата да стои в модулен монолит с PostgreSQL като source of truth.

## 12. Надеждност и отказоустойчивост

Продуктът не изисква сложна distributed resilience архитектура в началото, но изисква:

- ежедневни backup-и;
- point-in-time recovery за базата;
- versioning или retention политика за документи;
- retry механизъм за jobs;
- dead-letter обработка за неуспешни известия;
- health checks за API, database и worker.

## 13. Препоръчителна deployment архитектура

Минимална production архитектура:

- `Nginx` reverse proxy layer;
- Next.js web app;
- Node.js API app;
- background worker;
- managed PostgreSQL primary + read replica;
- Redis;
- managed S3-compatible storage;
- reverse proxy / edge hardening layer;
- centralized logging and error monitoring.

Не е необходимо Kubernetes в началото.

По-добрият избор е:

- Docker containers;
- managed container hosting;
- managed database;
- managed storage.

## 14. Препоръка за бъдеща еволюция

Продуктът трябва да се развива в следния ред:

1. стабилен модулен монолит;
2. силна вътрешна домейн изолация;
3. multi-tenant hardening;
4. Redis cache layer и read replicas;
5. background automation;
6. reporting и AI слой;
7. едва след реален operational pain — евентуално отделяне на ограничени подсистеми като notifications или document processing.

### 14.1 Архитектурна позиция за 10 000 DAU

За цел от около 10 000 дневно активни потребители препоръката остава:

- да не се преминава автоматично към microservices;
- да се използва scale-ready modular monolith;
- да се разделят write path и read-heavy path;
- да се въведат cache и replica стратегии;
- да се ограничат тежките операции в асинхронни worker-и;
- да се подготви selective extraction само за hot subsystems при доказана нужда.

## 15. Окончателна архитектурна препоръка

Най-добрият архитектурен избор за този продукт е:

- `Next.js` за web layer;
- `Node.js` backend като модулен монолит;
- `PostgreSQL` като primary transactional database;
- `Redis` като cache и coordination layer;
- `S3-compatible object storage` за документи;
- `PostgreSQL-backed jobs + transactional outbox` за асинхронна обработка;
- `AI services layer` с asynchronous execution и human-in-the-loop контрол;
- `shared-schema multi-tenant model` с `tenant_id` и RLS;
- силен `audit`, `security` и `document control` модел.

Това решение е най-доброто за:

- текущия размер на системата;
- сигурността;
- maintainability;
- цена;
- бъдеща SaaS продажба към повече автошколи.
