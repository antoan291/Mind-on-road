# React Engineering Notes

## Source influences

This project should follow practical React engineering habits inspired by:
- Dan Abramov / gaearon
- Theo Browne / t3dotgg and the wider t3-oss ecosystem

## What we keep from them

- Prefer simple, explicit React flows over clever abstractions.
- Keep component state local until there is a real reason to lift it.
- Avoid giant shared utility layers that hide business logic.
- Split the app by feature and workflow, not by random technical buckets.
- Keep route files thin when possible and move reusable UI into small focused components.
- Prefer clear typed boundaries and predictable data flow.
- Co-locate mock data, feature helpers, and page-specific UI when it improves maintainability.
- Do not over-engineer global state.
- Keep React code readable first, abstract second.

## Current implication for this project

Long term, the frontend should move away from oversized catch-all page files and toward:
- feature-oriented page modules
- smaller UI sections per screen
- shared primitives only for true shared patterns
- predictable route-level composition

## Rule for future work

When changing or adding React code, prefer the simplest maintainable structure that:
- keeps behavior explicit
- keeps files understandable
- keeps feature logic close to the screen that owns it
