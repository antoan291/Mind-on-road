# Frontend Reference Library

## 1. Goal

This file collects the best frontend learning and implementation sources for this project.

It is intentionally curated.  
The goal is not to collect every article on the internet, but to keep the strongest references that should guide real work.

## 2. Core Official Docs

### React

- [React Learn](https://react.dev/learn)
- [Thinking in React](https://react.dev/learn/thinking-in-react)
- [Describing the UI](https://react.dev/learn/describing-the-ui)
- [Render and Commit](https://react.dev/learn/render-and-commit)
- [Managing State](https://react.dev/learn/managing-state)

Why these matter:

- they teach the correct order for building React screens;
- they reinforce component thinking, state discipline, and predictable rendering.

### Vite

- [Vite Guide](https://vite.dev/guide/)

Why it matters:

- it is the actual frontend build tool in this project;
- it defines the dev/build environment and plugin model.

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

Why it matters:

- this project must stay type-safe across UI models, forms, route props, and API contracts.

### React Router

- [Picking a Router](https://reactrouter.com/docs/en/v6/routers/picking-a-router)
- [Route](https://reactrouter.com/api/components/Route/)
- [Form](https://reactrouter.com/api/components/Form)

Why it matters:

- routing, navigation, form submission patterns, and route structure are core to this admin product.

## 3. State, Data, and Forms

### TanStack Query

- [TanStack Query Overview](https://tanstack.com/query/latest/docs/framework/react/overview)

Why it matters:

- it is the chosen server-state layer for the project.

### Zustand

- [Zustand Introduction](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [Zustand Learn](https://zustand.docs.pmnd.rs/learn/index)
- [Zustand Testing Guide](https://zustand.docs.pmnd.rs/learn/guides/testing)

Why it matters:

- it is the chosen global client-state layer for lightweight shared UI state.

### React Hook Form

- [React Hook Form](https://react-hook-form.com/)

Why it matters:

- this product is form-heavy and needs performant, maintainable forms.

### Zod

- [Zod Intro](https://zod.dev/)
- [Zod Package Docs](https://zod.dev/packages/zod)

Why it matters:

- schema validation should align form validation and future backend DTO validation.

## 4. Testing

- [React Testing Library Intro](https://testing-library.com/docs/react-testing-library/intro/)
- [React Testing Library Setup](https://testing-library.com/docs/react-testing-library/setup/)
- [Playwright Intro](https://playwright.dev/docs/intro)

Why these matter:

- frontend testing should reflect how users interact with the product;
- E2E testing is important for high-value admin flows.

## 5. Project-Specific Human References

These are not official docs, but they are valuable engineering references for style and judgment:

- [Dan Abramov / gaearon](https://github.com/gaearon?tab=repositories)
- [Theo Browne / t3dotgg](https://github.com/t3dotgg?tab=repositories)

Use them for:

- code organization instincts;
- practical React judgment;
- readable engineering style.

Do not copy them blindly.  
Use them as quality references.

## 6. Books and Internal Sources

- [agent/source_registry.md](../../source_registry.md)
- [agent/backend/research/backend_architecture_standards.md](../../backend/research/backend_architecture_standards.md)
- `Clean Code`

Even for frontend work, these matter because the main frontend problems in large products are rarely visual only.  
They are structure, naming, consistency, and maintainability problems.
