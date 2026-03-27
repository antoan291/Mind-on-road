# Common

Споделени backend building blocks, които са достатъчно общи и не принадлежат на конкретен bounded context.

## Поддиректории

- `contracts` - shared interfaces и small abstractions
- `decorators` - custom decorators за transport и auth convenience
- `errors` - base error types и error helpers
- `guards` - shared guards
- `interceptors` - shared interceptors
- `pipes` - shared validation/transformation pipes
- `types` - shared primitive backend types
- `utils` - малки технически utilities
- `context` - request context и tenant/user context carriers
- `filters` - global exception filters
- `validation` - shared validation helpers

## Guardrail

Ако един helper е специфичен за модул, той не трябва да се премества в `common`.
