# Infrastructure

Тук живеят shared technical adapters и provider integrations, които не принадлежат на един единствен bounded context.

## Поддиректории

- `database/prisma` - shared Prisma bootstrap и client wiring
- `cache/redis` - Redis clients и cache coordination
- `storage/object-storage` - S3-compatible storage adapters
- `queue/pg-boss` - PostgreSQL-backed job queue integration
- `logger/pino` - structured logging setup
- `telemetry/opentelemetry` - tracing и metrics bootstrap

## Guardrail

Тук не трябва да се качва домейн логика само защото зависи от техническа библиотека.
