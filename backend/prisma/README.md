# Prisma

Тук живеят Prisma schema, migrations и seed scripts.

Правила:
- tenant-owned таблиците трябва да са tenant-aware
- финансовите стойности трябва да са в minor units
- документите пазят metadata в базата, не binary data
- чувствителните таблици трябва да са проектирани с audit и restore дисциплина
