# Jobs

Тук живее оркестрацията на background processing слоя.

## Поддиректории

- `outbox` - transactional outbox processing
- `schedulers` - scheduled jobs и periodic orchestration
- `workers` - worker entry points и job handlers

## Guardrail

Domain rule-ите на конкретен модул остават в модула; `jobs` само ги задейства безопасно и наблюдаемо.
