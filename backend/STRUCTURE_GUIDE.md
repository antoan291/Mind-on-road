# Structure Guide

## Module anatomy

- `application/commands` - command use cases
- `application/queries` - query orchestration
- `application/services` - application services и orchestration
- `application/dto` - входни и изходни application DTO-та
- `domain/entities` - domain entities
- `domain/value-objects` - value objects
- `domain/events` - domain events
- `domain/repositories` - repository contracts
- `domain/services` - pure domain services
- `infrastructure/persistence/prisma` - Prisma repositories и transaction-aware data access
- `infrastructure/mappers` - mapping между Prisma models, domain objects и read models
- `infrastructure/external` - integrations към storage, OCR, Viber, OpenAI и други providers
- `presentation/rest/controllers` - REST entry points за commands, uploads и integrations
- `presentation/rest/requests` - request DTO и transport validation модели
- `presentation/rest/responses` - response DTO и transport serializers
- `presentation/graphql/resolvers` - GraphQL read resolvers
- `presentation/graphql/types` - GraphQL object types и read model presentation types
- `presentation/graphql/inputs` - GraphQL input types, когато модулът има нужда от тях

## Dependency direction

- `presentation` зависи от `application`
- `application` зависи от `domain`
- `infrastructure` имплементира contracts от `domain` и `application`
- `domain` не зависи от `presentation`, `infrastructure`, Express-style transport code или Prisma
- cross-module достъпът минава през explicit contracts и exported application services, не през произволен import към чужд persistence слой

## Placement rules

- Ако кодът оркестрира use case, но не съдържа core domain invariants, той живее в `application/services`.
- Ако кодът представлява command use case с ясен вход и странични ефекти, той живее в `application/commands`.
- Ако кодът връща read model, aggregation или list view, той живее в `application/queries`.
- Ако кодът описва правила на домейна, той живее в `domain`.
- Ако кодът говори с Prisma, Redis, storage, queue, OCR или AI provider, той живее в `infrastructure`.
- Ако кодът знае за HTTP, GraphQL, file upload transport или request metadata, той живее в `presentation`.

## Shared folders outside modules

- `src/common` е за truly shared backend building blocks.
- `src/infrastructure` е за shared technical adapters, които не принадлежат на един модул.
- `src/bootstrap` е за application startup composition.
- `src/jobs` е за worker orchestration и scheduled processing entry points.
- `src/config` е за validated configuration и environment-driven behavior.

## What should not happen

- Prisma clients директно в controllers или handlers.
- Domain logic в resolvers, controllers или guards.
- Shared utils, които реално съдържат домейн логика на конкретен модул.
- Direct imports между два модула през `infrastructure/persistence/prisma`.
- New feature code, сложен в `common`, само защото още няма ясно място.

## New module checklist

1. Създай bounded context само ако логиката не принадлежи естествено на съществуващ модул.
2. Създай `README.md`, `index.ts` и четирите основни слоя.
3. Опиши командите, query-тата и домейн отговорността преди да пишеш transport код.
4. Пази module public surface малък и ясен.
5. Ако модулът засяга tenant access, audit или money, валидирай това в дизайна от ден първи.
