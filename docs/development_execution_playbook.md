# Development Execution Playbook

## 1. Purpose

This document defines the most professional, low-risk, step-by-step way to build this product from the current state to production.

It is written for the current situation:

- the frontend already exists visually with static or mock data;
- the product vision and architecture are largely defined;
- the next challenge is disciplined execution without rushing, regressions, or architectural drift.

This document is the practical answer to:

- what to do first;
- what to do second;
- what never to skip;
- how to move from static frontend to working SaaS;
- how to keep the codebase clean, stable, and understandable.

## 2. Source Base Behind This Playbook

This playbook is based on:

- `Clean Code`
- `The DevOps Handbook`
- `Building Microservices`
- `goldbergyoni/nodebestpractices`
- `bulletproof-nodejs`
- React official guidance on building from mockup to state and data flow
- GitHub official guidance on branch-based delivery flow
- the project architecture and security documents already written in `docs`

The project also keeps internal sources and engineering memory in:

- [core/source_registry.md](/C:/AD/work/My%20company/school/core/source_registry.md)
- [core/research/backend_architecture_standards.md](/C:/AD/work/My%20company/school/core/research/backend_architecture_standards.md)

Useful anchors:

- [Thinking in React](https://react.dev/learn/thinking-in-react)
- [GitHub flow](https://docs.github.com/get-started/using-github/github-flow)
- [Git workflows](https://docs.github.com/en/get-started/git-basics/git-workflows)
- [nodebestpractices](https://github.com/goldbergyoni/nodebestpractices)
- [bulletproof-nodejs](https://github.com/santiq/bulletproof-nodejs)

## 3. Core Philosophy

The best developers do not build the entire system in one pass.

They usually work in this order:

1. clarify the system;
2. define boundaries;
3. stabilize the structure;
4. ship vertical slices;
5. verify each slice;
6. document what was decided;
7. only then expand.

For this project, that means:

- do not rush to backend endpoints before the domain is clear;
- do not rush to complex automation before the core workflows are stable;
- do not rush to integrations before the internal system of record is reliable;
- do not rush to polish and animations while structural bugs remain;
- do not implement features in random order.

## 4. Non-Negotiable Working Rules

### 4.1 Every change must have a place

Every new change should belong to one of these:

- product rule;
- frontend structure;
- backend module;
- database schema;
- automation flow;
- infrastructure or deployment;
- documentation update.

If a change does not clearly belong somewhere, it is probably too vague.

### 4.2 Every change must be versioned

For every meaningful change:

- record what changed;
- record why it changed;
- record risks or regressions;
- record the next expected step.

### 4.3 Every repeated mistake becomes a rule

If a bug repeats:

- the root cause must be documented;
- the prevention rule must be documented;
- the workflow must be adjusted so it becomes harder to repeat.

### 4.4 No giant files, no anonymous structure

Files, folders, and components must be:

- named by business purpose;
- small enough to understand quickly;
- grouped by feature;
- readable without needing tribal knowledge.

### 4.5 Static-first, then dynamic, then automated

The correct order is:

1. static UX;
2. structured mock data;
3. typed contracts;
4. real backend behavior;
5. automation;
6. integrations;
7. optimization.

## 5. The Correct Project Phases

## 5.1 Phase 0: Freeze the Product Rules

Before more development, ensure the rules are stable in docs:

- roles and permissions;
- multi-tenant behavior;
- module boundaries;
- compliance-sensitive flows;
- AI boundaries;
- financial boundaries;
- feature-flag/platform-admin rules.

Done means:

- the team can answer “who can do what?” and “what happens when?” from docs, not from memory.

For this project, this phase is mostly done, but must remain maintained.

## 5.2 Phase 1: Stabilize the Frontend Prototype

This is the current immediate priority.

The goal is not “make it prettier”.  
The goal is:

- remove broken text;
- remove structural inconsistencies;
- centralize static content;
- centralize mock business data;
- standardize dialogs, cards, tables, filters, drawers, and layouts;
- ensure every screen behaves consistently.

What should happen in this phase:

- move static labels and content into `content` JSON/data files;
- move mock business records into central mock DB files;
- replace one-off UI patterns with reusable shared components;
- standardize edit flows as dialogs or drawers by clear UX rules;
- ensure all pages can be demoed to a client without obvious breakage.

Done means:

- the frontend behaves like a stable product prototype;
- static content is no longer scattered randomly across pages;
- the UI is credible enough to drive backend implementation.

## 5.3 Phase 2: Define Frontend-to-Backend Contracts

This is the phase many teams skip too early. It should not be skipped.

Before building many backend routes, define:

- main entities;
- field names;
- enum values;
- status values;
- filtering options;
- table payload shapes;
- create/edit form payloads;
- detail view response shapes.

For this project, that means defining contracts for:

- students;
- instructors;
- vehicles;
- theory groups and attendance;
- practical lessons;
- payments;
- invoices;
- documents;
- notifications;
- reporting;
- AI workspaces.

The correct output of this phase is:

- typed frontend model files;
- API contract notes or DTO notes;
- mock data that mirrors the real future database shape closely.

Done means:

- the frontend is no longer just visual;
- it becomes a realistic contract-driven shell of the final system.

## 5.4 Phase 3: Design the Database Carefully

Only after product rules and contracts are stable enough should the database be finalized.

In this phase:

- define tenant-aware core tables;
- define foreign keys and constraints;
- define audit tables;
- define money fields in minor units;
- define document metadata tables;
- define OCR and AI tracking tables;
- define background job and automation support tables where needed.

For this project, this phase must pay special attention to:

- multi-tenant isolation;
- financial correctness;
- attendance and lesson history;
- document metadata and expiry tracking;
- AI usage and auditability;
- platform-admin feature flags by school.

Done means:

- the schema reflects the business, not just the screens;
- the schema is ready for safe backend development.

## 5.5 Phase 4: Build the Backend Foundation

Only after the above should serious backend implementation begin.

The backend foundation phase includes:

- Express application bootstrap;
- environment config;
- logger;
- error handling;
- authentication skeleton;
- authorization guards/policies;
- Prisma integration;
- storage abstraction;
- audit logging basics;
- job runner basics;
- health endpoints and operational basics.

This phase should not try to “finish the whole backend”.

It should only establish:

- the runtime skeleton;
- the module boundaries;
- the common backend building blocks.

Done means:

- the backend can safely host modules without turning into chaos.

## 5.6 Phase 5: Build Vertical Slices, Not Random Endpoints

This is one of the most important rules.

Do not build one huge generic backend and hope the frontend will fit later.

Build vertical slices module by module.

The recommended slice order for this project is:

1. `identity + tenancy + platform-admin`
2. `students`
3. `payments`
4. `invoices`
5. `documents`
6. `theory`
7. `practice`
8. `instructors`
9. `vehicles`
10. `notifications`
11. `reporting`
12. `ai`

Each slice should include:

- schema support;
- backend endpoints/services;
- frontend integration;
- edit/create flows;
- basic validation;
- audit-relevant behavior;
- realistic demo completion.

Done means:

- one business flow is truly working end to end.

## 5.7 Phase 6: Add Automation Only After the Core Flow Is Real

Automation should not be phase 1 engineering.

Automation should come after:

- the records exist;
- the statuses are stable;
- the triggers are trustworthy;
- the data model is good enough.

For this project, the first automations should be:

1. payment reminders;
2. document expiry reminders;
3. missing-document reminders;
4. attendance and no-show follow-up;
5. instructor/vehicle compliance alerts;
6. owner/admin financial summaries;
7. student risk scoring;
8. OCR-assisted document intake.

Done means:

- automation is based on reliable system state, not UI guesses.

## 5.8 Phase 7: Add External Integrations Carefully

Only once internal flows are stable should external boundaries be added:

- NRA/NAP-related finance integrations;
- IAAA/DAI reporting support;
- SMS/Viber/email providers;
- object storage;
- accounting sync;
- payment providers if added later.

Rule:

- every external integration must be behind a clear adapter boundary.

Done means:

- the system remains replaceable and testable.

## 5.9 Phase 8: Hardening, QA, and Release Readiness

Before a real pilot or release:

- do role-based QA passes;
- do tenant-isolation QA passes;
- do finance QA passes;
- do document/OCR QA passes;
- do restore and backup checks;
- do alerting and monitoring checks;
- do performance checks on the riskiest screens and operations.

Done means:

- the team trusts the system enough to let real schools use it.

## 6. What You Should Work On, In Practice

Given the current state of the project, the most professional next execution order is:

### Step 1

Finish frontend stabilization:

- remove remaining broken texts and layout inconsistencies;
- centralize all remaining static content and mock data;
- ensure every edit/create interaction uses a predictable reusable pattern;
- make every major screen demo-safe.

### Step 2

Create typed domain contracts for the key modules:

- students;
- payments;
- invoices;
- documents;
- theory;
- practice.

### Step 3

Finalize database modeling from those contracts.

### Step 4

Finish backend foundation for Express + TypeScript + Prisma.

### Step 5

Implement the first real vertical slice:

- `student create/edit/detail`

Then:

- `payment create/edit/detail`
- `invoice create/edit/detail`
- `document upload/review/detail`

### Step 6

Wire the frontend screen-by-screen to real APIs, starting from the slices above.

### Step 7

Only then add automations triggered by those real records.

## 7. How to Work on Each Feature

Every feature should go through the same sequence:

1. define the business rule;
2. check existing docs;
3. update docs if needed;
4. define the UI states;
5. define the data contract;
6. define the database impact;
7. build backend behavior;
8. connect the frontend;
9. test the happy path;
10. test important edge cases;
11. record version and lessons learned.

If a feature skips steps `1-5`, it usually becomes expensive later.

## 8. Branching, Delivery, and Review Discipline

Use a lightweight branch-based workflow.

Per task:

- one branch per focused change;
- small, meaningful commits;
- no mixing unrelated refactors with business logic;
- reviewable PR-sized changes;
- merge only after the feature is understandable and stable.

This is aligned with GitHub’s own recommended branch-based flow.  
Source: [GitHub flow](https://docs.github.com/get-started/using-github/github-flow)

## 9. Frontend-Specific Rules

The React part should continue to follow this order:

1. break the UI into component hierarchy;
2. build a static version from data;
3. identify minimal state;
4. decide where state should live;
5. only then add interactivity and backend connection.

This is directly aligned with the official React guidance.  
Source: [Thinking in React](https://react.dev/learn/thinking-in-react)

For this project that means:

- page layout first;
- reusable cards/tables/drawers/dialogs second;
- mock data third;
- real API connection fourth;
- optimization last.

## 10. Backend-Specific Rules

The backend should continue to follow:

- modular monolith;
- business-module boundaries;
- thin Express transport layer;
- application/domain/infrastructure separation;
- explicit error handling;
- structured logging;
- tenant-aware authorization.

Do not build generic “utils architecture”.  
Build business modules.

## 11. DevOps and Release Rules

Deployment quality is part of development quality.

That means:

- environment separation from the start;
- repeatable deployment;
- backups and restore playbooks;
- monitoring and alerting;
- secrets hygiene;
- operational runbooks;
- no production-by-guessing.

## 12. Definition of Done for This Project

A module is not done when it “looks done”.

A module is done when:

- the business rule is clear;
- the UI is stable;
- the data contract is stable;
- the backend behavior exists;
- the database model supports it correctly;
- permissions are correct;
- audit/logging needs are handled;
- the main edge cases are checked;
- the docs are updated.

## 13. Final Recommendation

The smartest path for this project is:

- do not rush;
- stabilize the frontend properly;
- turn the mock frontend into a contract-driven frontend;
- then build backend vertical slices in a strict order;
- then add automation;
- then add regulated/institutional integrations;
- then harden for production.

The correct execution model is not:

- “build everything fast”.

It is:

- “build the right layers in the right order so the system stays clean, safe, and scalable.”
