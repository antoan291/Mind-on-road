# Naming Conventions

## Goal

Имената трябва да показват отговорност, а не framework trivia. Човек трябва да разбере какво прави един файл само от пътя и името му.

## File naming

- Използвай `kebab-case` за файлове и директории.
- Името на файла трябва да описва ролята му ясно.
- Не използвай неясни съкращения като `svc`, `util2`, `helper-final`.

## Recommended patterns

- `create-payment.service.ts`
- `save-theory-attendance.command.ts`
- `list-report-transactions.query.ts`
- `payment.repository.ts`
- `payment-prisma.repository.ts`
- `payment.mapper.ts`
- `payments.controller.ts`
- `payments.resolver.ts`
- `create-payment.request.ts`
- `payment-summary.response.ts`
- `payment.graphql-type.ts`

## Class naming

- Services: `CreatePaymentService`
- Commands: `SaveTheoryAttendanceCommand`
- Queries: `ListReportTransactionsQuery`
- Repositories: `PaymentRepository`, `PrismaPaymentRepository`
- Controllers: `PaymentsController`
- Resolvers: `PaymentsResolver`
- DTOs: `CreatePaymentDto`, `PaymentSummaryResponse`
- Guards: `TenantAccessGuard`
- Interceptors: `AuditTrailInterceptor`

## Variable naming

- Използвай ясни бизнес имена: `tenantId`, `studentId`, `paymentStatus`, `attendanceRecord`
- Не използвай еднобуквени имена извън кратки локални loop индекси.
- Колекции да са в множествено число: `students`, `invoices`, `reportTransactions`
- Булеви стойности да започват с `is`, `has`, `can`, `should`

## Naming discipline

- Името трябва да отразява текущата роля, не бъдеща възможна употреба.
- Ако се налага дълъг коментар какво прави файлът, най-вероятно името не е достатъчно добро.
- Ако една директория започне да събира разнородни неща, раздели я по по-ясна отговорност вместо да добавяш по-общи имена.
