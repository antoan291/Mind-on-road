# Module Template

Използвай този шаблон, когато добавяш нов bounded context.

```text
src/modules/example-module/
  application/
    commands/
    queries/
    services/
    dto/
  domain/
    entities/
    value-objects/
    events/
    repositories/
    services/
  infrastructure/
    persistence/
      prisma/
    mappers/
    external/
  presentation/
    rest/
      controllers/
      requests/
      responses/
    graphql/
      resolvers/
      types/
      inputs/
  index.ts
  README.md
```

## Minimal responsibilities

- `README.md` описва кратко модула, неговите use cases и boundaries.
- `index.ts` е публичният entry point на bounded context-а и описва module metadata/export surface.
- `application` пази orchestration логиката.
- `domain` пази core domain правилата.
- `infrastructure` пази техническите имплементации.
- `presentation` пази входните точки за REST и GraphQL.

## When not to create a new module

- Когато логиката е естествено продължение на вече съществуващ bounded context.
- Когато разделението е само по технически причини, а не по бизнес смисъл.
- Когато новата папка ще съдържа само един helper без собствен домейн.

## Before coding

1. Определи domain responsibility.
2. Определи inbound flows: REST, GraphQL, jobs или комбинация.
3. Определи repositories и external dependencies.
4. Определи tenant, audit и security ефектите.
