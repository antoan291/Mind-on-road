# Frontend стандарти

## 1. Цел

Това са frontend правилата за проекта.

Те съществуват, за да държат React кода:

- чист;
- reusable;
- четим;
- предвидим;
- лесен за свързване с backend по-късно.

## 2. Stack Rules

- Runtime: `React + Vite + TypeScript`
- Routing: `react-router`
- Server state: `TanStack Query`
- Client global state: `Zustand`
- Forms: `React Hook Form`
- Validation: `Zod`

## 3. Правила за файлове и папки

- Именувай файловете по business purpose, а не с неясни думи като `all`, `misc` или `helper`.
- Дръж route файловете тънки, когато е възможно.
- Разделяй големите pages на фокусирани local components.
- Слагай shared primitives в shared UI папки само когато реално се преизползват.
- Дръж feature-specific components близо до page/module-а, който ги притежава.

## 4. Правила за компоненти

- Един компонент трябва да има една ясна отговорност.
- Избягвай giant components със смесени data loading, forms, layout и business rules.
- Предпочитай explicit props и предвидим data flow.
- Не скривай business behavior в generic utility components.
- Преизползвай съществуващи cards, dialogs, drawers, tables и form primitives преди да създаваш нови.

## 5. State правила

- Дръж state локален, освен ако наистина не е shared.
- Не слагай server state в Zustand.
- Не използвай global state за form state.
- Използвай URL state за filters, tabs и view modes, когато state-ът е navigation state.

## 6. Data правила

- Static labels трябва да живеят в централни content files, когато се преизползват.
- Mock business data трябва да живеят в централни mock-db файлове, не вътре в pages.
- Mock data трябва да имитират бъдещите backend payloads максимално близко.
- Frontend models и field names трябва да се сближават с бъдещите реални API contracts.

## 7. UX правила

- Подобни действия трябва да се държат по сходен начин в целия продукт.
- Edit actions трябва да отварят предвидим dialog или drawer, не случаен UI pattern.
- Quick actions трябва да са guided, не двусмислени.
- Tables, cards и detail panels трябва да пазят контекст и да не дезориентират потребителя.
- Използвай български UI текст консистентно.

## 8. Правила за текст и encoding

- Целият frontend текст трябва да се съхранява и редактира като чист UTF-8.
- Ако файл получи масова mojibake корупция, замени файла чисто вместо да patch-ваш случайни фрагменти.
- След text-heavy UI промени търси `????`, `Ð`, `Ã` и подобни corruption patterns преди да сметнеш задачата за приключена.

## 9. Testing правила

- Важните screens трябва да се тестват през user behavior, не през implementation details.
- Предпочитай React Testing Library за component behavior.
- Предпочитай Playwright за critical end-to-end flows.
- Изгради reusable test setup около реалистични providers и router context.

## 10. Definition of Done

Frontend feature не е готов само защото изглежда правилно.

Готов е, когато:

- UI е визуално консистентен;
- текстът е коректен;
- interaction flow-ът е coherent;
- static/mock data структурата е реалистична;
- component структурата е четима;
- feature-ът е готов за свързване към реално backend поведение.
