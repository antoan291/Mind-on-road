# Frontend Standards

## 1. Goal

These are the frontend rules for this project.

They exist to keep the React code:

- clean;
- reusable;
- readable;
- predictable;
- easy to connect to the backend later.

## 2. Stack Rules

- Runtime: `React + Vite + TypeScript`
- Routing: `react-router`
- Server state: `TanStack Query`
- Client global state: `Zustand`
- Forms: `React Hook Form`
- Validation: `Zod`

## 3. File and Folder Rules

- Name files by business purpose, not by vague words like `all`, `misc`, or `helper`.
- Keep route files thin when possible.
- Split large pages into focused local components.
- Put shared primitives in shared UI folders only when they are truly reused.
- Keep feature-specific components close to the page or module that owns them.

## 4. Component Rules

- One component should have one clear responsibility.
- Avoid giant components with mixed data loading, forms, layout, and business rules.
- Prefer explicit props and predictable data flow.
- Do not hide business behavior inside generic utility components.
- Reuse existing cards, dialogs, drawers, tables, and form primitives before creating new ones.

## 5. State Rules

- Keep state local unless it is truly shared.
- Do not put server state into Zustand.
- Do not use global state for form state.
- URL state should be used for filters, tabs, and view modes when the state is navigational.

## 6. Data Rules

- Static labels should live in central content files when reused.
- Mock business data should live in central mock-db files, not inside pages.
- Mock data should imitate future backend payloads as closely as possible.
- Frontend models and field names should converge toward the future real API contracts.

## 7. UX Rules

- Similar actions must behave similarly across the product.
- Edit actions should open a predictable dialog or drawer, not random UI patterns.
- Quick actions should feel guided, not ambiguous.
- Tables, cards, and detail panels should preserve context and not disorient the user.
- Use Bulgarian UI text consistently.

## 8. Text and Encoding Rules

- All frontend text must be stored and edited as clean UTF-8.
- If a file gets mass mojibake corruption, replace the file cleanly instead of patching random fragments.
- After text-heavy UI changes, search for `????`, `Ð`, `Ã`, and similar corruption patterns before considering the task finished.

## 9. Testing Rules

- Important screens should be testable by user behavior, not implementation details.
- Prefer React Testing Library for component behavior.
- Prefer Playwright for end-to-end critical flows.
- Build reusable test setup around realistic providers and router context.

## 10. Definition of Done

A frontend feature is not done when it only looks right.

It is done when:

- the UI is visually consistent;
- the text is correct;
- the interaction flow is coherent;
- the static/mock data structure is realistic;
- the component structure is readable;
- the feature is ready to connect to real backend behavior.
