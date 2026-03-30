# Frontend Delivery Plan

## 1. Goal

This document explains the correct implementation order for the frontend.

The project already has a visual frontend prototype.  
The job now is to turn it into a stable, contract-driven frontend without chaos.

## 2. Correct Order

### Step 1: Stabilize the existing prototype

- remove broken text and visual regressions;
- remove inconsistent UI patterns;
- standardize dialogs, drawers, tables, and cards;
- make all key pages demo-safe.

### Step 2: Centralize static content

- move repeated labels and UI copy into shared content files;
- keep page-specific content structured, not scattered.

### Step 3: Centralize mock business data

- move students, payments, invoices, and documents into mock-db files;
- make the shape realistic enough to mirror the future API.

### Step 4: Define frontend contracts

For each major module define:

- list view shape;
- detail view shape;
- create payload;
- edit payload;
- filtering shape;
- status enums.

### Step 5: Split large pages

- break oversized pages into local feature components;
- keep route-level orchestration readable;
- move repeated UI patterns into reusable components only when genuinely shared.

### Step 6: Prepare for real API integration

- define query keys and mutation boundaries;
- separate fetch logic from rendering logic;
- identify where TanStack Query will own the data flow.

### Step 7: Connect module by module

Recommended order:

1. students
2. payments
3. invoices
4. documents
5. theory
6. practice
7. instructors
8. vehicles
9. reporting
10. AI center

### Step 8: Add tests for critical flows

First test the flows that are expensive to break:

- student create/edit;
- payment registration;
- invoice creation;
- document upload/review;
- theory attendance save;
- practical lesson editing.

## 3. Per-Feature Execution Checklist

For each frontend feature:

1. check the docs;
2. confirm the business rule;
3. confirm the UI states;
4. confirm the data shape;
5. implement the UI cleanly;
6. wire to mock data realistically;
7. make it reusable where appropriate;
8. leave it ready for backend integration.

## 4. Main Anti-Patterns

Do not:

- keep giant page files forever;
- scatter labels and data across many pages;
- create a new UI pattern for every feature;
- wire fake logic that cannot map to a real backend later;
- mix domain data, layout, and modal logic in one file without boundaries.
