# Frontend Knowledge Synthesis

## 1. Purpose

This document turns the curated frontend sources into project-ready knowledge.

It is not a copy of the docs.  
It is a structured synthesis of:

- what matters;
- what to apply;
- what to avoid;
- how it maps to this project.

## 2. React: The Core Build Order

The strongest stable lesson from the official React docs is not "learn hooks".

It is this build order:

1. break the UI into components;
2. build a static version;
3. identify the minimal state;
4. decide where state lives;
5. add real data flow.

Sources:

- [Thinking in React](https://react.dev/learn/thinking-in-react)
- [Managing State](https://react.dev/learn/managing-state)
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)

### What this means for the project

- the current static frontend is not wasted work; it is phase 1 of the correct React process;
- the next step is not random backend wiring;
- the next step is to make the frontend contract-driven and state-disciplined.

### Project rule

For every new page:

- first define component hierarchy;
- then static layout;
- then UI states;
- then mock data;
- then real API connection.

## 3. React Rendering and State Discipline

The official docs emphasize that React rendering is a function of state and props.  
This sounds basic, but it kills many bad patterns.

Sources:

- [Render and Commit](https://react.dev/learn/render-and-commit)
- [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)

### Project implications

- do not store duplicated state in many places;
- do not create derived state unless necessary;
- do not put large mutable business records into arbitrary component state;
- compute what can be computed;
- keep edit dialog state local unless shared across the flow.

### Practical pattern

Good:

- route owns selected record ID;
- detail drawer reads by ID;
- edit dialog receives current values and updates local form state;
- mutation invalidates the relevant query.

Bad:

- table, drawer, modal, and parent all storing separate mutable copies of the same record.

## 4. Component Design and Reuse

From React practice, Clean Code, and the engineering references, the reusable rule is:

- reuse patterns, not accidental complexity.

### What should be reused in this project

- modal shell;
- drawer shell;
- table layout;
- filter bar;
- stat card;
- form field primitives;
- page section shells;
- status badges;
- content wrappers.

### What should stay local

- page-specific mapping logic;
- feature-specific business copy;
- module-specific row rendering;
- feature-specific dialog fields.

### Working rule

Create shared components only when:

- the pattern is repeated;
- the props remain understandable;
- the abstraction reduces total complexity.

## 5. Routing and Navigation Knowledge

React Router is not only a router.  
It also defines useful patterns for forms, data transitions, and route structure.

Sources:

- [React Router Route](https://reactrouter.com/api/components/Route/)
- [React Router Form](https://reactrouter.com/api/components/Form)

### Project implications

- route files should define screen-level composition;
- nested layouts should preserve user context;
- tabs and filtered views should reflect URL state where useful;
- forms that benefit from history/navigation semantics should not be hacked as random buttons.

### Practical application

Good URL-backed states:

- current tab in reports or AI center;
- selected date range;
- student filters;
- pagination state.

## 6. Server State vs Client State

This project has many screens with backend data and some shared UI state.  
That means we should not confuse:

- server state;
- global UI state;
- local state;
- form state.

### Chosen model

- `TanStack Query` for server state
- `Zustand` for lightweight global client state
- `React Hook Form` for forms
- URL state for navigational filters
- local React state for local UI behavior

### Why this matters

Many admin apps become unstable because they put everything into one state model.  
This project should not do that.

## 7. TanStack Query Knowledge

TanStack Query exists to manage fetching, caching, background refresh, invalidation, and mutation state.

Source:

- [TanStack Query Overview](https://tanstack.com/query/latest/docs/framework/react/overview)

### What to apply

- every module should define clear query keys;
- mutations should invalidate only what needs refreshing;
- list/detail flows should use predictable cache strategy;
- dashboard and reporting screens should use query composition, not random `useEffect` fetches.

### Project-specific use cases

- students list and student detail;
- payment list and payment detail;
- invoice list and invoice detail;
- document list and review detail;
- reporting summaries;
- AI center read views.

## 8. Zustand Knowledge

Zustand is useful when you truly need lightweight shared client state without Redux-level ceremony.

Sources:

- [Zustand Introduction](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [Zustand updating state guide](https://zustand.docs.pmnd.rs/learn/guides/updating-state)

### What to apply

- keep stores small;
- colocate actions with the store;
- avoid using Zustand as a fake database;
- use selectors to avoid unnecessary rerenders.

### Good project use cases

- app shell preferences;
- sidebar/mobile nav state;
- selected workspace view state if it spans multiple components;
- temporary cross-component UI orchestration.

## 9. Forms: React Hook Form + Zod

The project is form-heavy, which means forms must be first-class engineering citizens.

Sources:

- [React Hook Form](https://react-hook-form.com/)
- [Zod Intro](https://zod.dev/)

### What to apply

- forms should be schema-validated;
- forms should separate display from payload shape cleanly;
- defaults should be explicit;
- dialog forms should be ready for backend DTO alignment.

### Project-critical forms

- create/edit student;
- register payment;
- create/edit invoice;
- upload/review document metadata;
- theory attendance save;
- practical lesson edit.

## 10. TypeScript Knowledge

TypeScript is not decoration in this project.

Source:

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### What to apply

- type business models explicitly;
- avoid `any`;
- centralize enums and status unions;
- let form schemas and frontend types converge;
- type reusable UI props clearly.

### Project rule

If a screen depends on a business record shape, that shape should exist as a named type.

## 11. Testing Knowledge

Testing should map to user behavior and business-critical risk.

Sources:

- [React Testing Library Intro](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Intro](https://playwright.dev/docs/intro)

### What to apply

- test by behavior, not internal implementation;
- use component tests for interactive UI behavior;
- use E2E tests for critical business flows.

### First frontend tests to add

- student create dialog flow;
- payment create/edit flow;
- invoice create/edit flow;
- document upload flow;
- theory attendance save flow;
- practical lesson edit flow.

## 12. Practical Lessons from Human References

### From Dan Abramov / gaearon

Keep React understandable.  
Do not hide core logic behind clever abstractions too early.

### From Theo Browne / t3dotgg

Move fast, but keep types, boundaries, and practical developer experience strong.

### What that means here

- prefer explicit patterns;
- keep page files readable;
- split by feature;
- keep state ownership obvious;
- do not let the frontend turn into a pile of unnamed helper abstractions.

## 13. Final Working Rules

For this project, the frontend should always move in this order:

1. stable UI shell;
2. centralized static content;
3. centralized mock business data;
4. typed contracts;
5. real query/mutation wiring;
6. test critical flows;
7. optimize and refine.

This is the correct way to turn the current static frontend into a production-capable frontend without chaos.
