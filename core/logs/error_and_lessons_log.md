# Error And Lessons Log

## Permanent rules

1. Do not claim a fix before checking the exact file and the exact failing error.
2. Do not use risky text rewrites on UI files when encoding may be corrupted; prefer controlled UTF-8 edits.
3. Do not leave giant page files when the page can be split into focused components.
4. Do not rely on chat memory only; record architecture, design, and research decisions in docs or core.
5. Do not repeat the same class of error after it has been logged here.

## Known project lessons

- Broken encoding in TypeScript/TSX files can cascade into parser errors and broken Bulgarian text. Always preserve UTF-8.
- Small, deliberate edits are safer than large shell rewrites in this environment.
- Product requirements should be recorded as source of truth in docs immediately after they are clarified.
- Reusable engineering references must live in the repo so the next project does not start from zero.
- Repository-level UTF-8 and ignore standards should be added early, before large code editing begins.
- Before writing feature code, finish the structure guide and naming rules so files do not start drifting into inconsistent patterns.
- Do not scaffold backend code around a framework assumption unless that framework is explicitly fixed in the project decisions.
