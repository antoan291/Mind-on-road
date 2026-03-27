# Modules

Всеки модул е bounded context с отделни `application`, `domain`, `infrastructure` и `presentation` слоеве.

## Layer intent

- `application` - use cases и orchestration
- `domain` - core business rules
- `infrastructure` - persistence и external integrations
- `presentation` - REST и GraphQL entry points

## Rule of thumb

GraphQL read resolvers и REST command handlers живеят в `presentation` слоя на съответния модул, а не в shared папки.

Cross-module imports трябва да са редки, ясни и предвидими.
