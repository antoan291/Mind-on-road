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
- Do not claim Python dependencies were installed when the runtime is unavailable in the current environment; scaffold the package cleanly and document the required dependencies explicitly.
- Once a new pipeline reaches the external provider successfully, distinguish provider quota failures from local code failures and surface the provider problem in a human-readable way.
- Remove real secrets from example files immediately; `.env.example` must always contain placeholders only.
- For OCR stacks, do not assume the latest package versions are the safest choice on Windows; validate the runtime combination and pin the versions when a known incompatibility appears.
- For PaddleOCR 3.x, do not rely on the older `ocr(..., cls=True)` flow. Inspect the real prediction payload and adapt to the current `predict()` API and its JSON wrapper before building parsers on top.
- For document OCR, runtime success is not enough; always tune the parser against a real sample document and add domain-specific cleanup rules for addresses, place names and bilingual labels.
## 2026-03-27 - OCR parser regression lesson

- Problem:
  - A generic heuristic for Bulgarian driving-licence names regressed and started picking header text or Latin duplicates instead of the real person names.
- Why it happened:
  - The parser moved away from the stable visual structure of the document and relied too much on loose text filtering.
- Fix:
  - Switched the driving-licence name extraction back to a positional parser based on the OCR block between markers `2` and `3`.
  - Added stronger normalization for Latin lookalike OCR characters.
- Rule going forward:
  - For structured identity documents, prefer template-aware or field-block-aware parsing over generic text guessing.
  - When a parser works for one document layout, do not broaden it without re-testing the same sample outputs end-to-end.

## 2026-03-27 - Document-specific field expectations

- Problem:
  - `постоянен_адрес` stayed `null` for the driving licence output and this looked like a parser miss.
- Clarification:
  - Not every target field is reliably present on every document type or every scan.
- Rule going forward:
  - When a field is optional or commonly absent for a given document type, return `null` with an explicit document-aware warning instead of pretending the extractor failed silently.

## 2026-03-27 - Driving licence categories rule

- Observation:
  - For the current Bulgarian driving-licence sample, categories are recognized much more reliably from the front side than from the back side.
- Rule going forward:
  - Extract category names from the strongest visible category line on the front side.
  - Use back-side dates as OCR-linked metadata and warn when the association is inferred by row/order rather than by a clean column parse.

## 2026-03-27 - Encoding bug in parser warnings

- Problem:
  - Warning messages were saved with broken mojibake text and appeared unreadable in the output JSON.
- Why it happened:
  - Some parser literals were left in corrupted encoding form instead of clean UTF-8/Unicode-safe strings.
- Rule going forward:
  - User-facing strings in automation outputs must be stored only as clean UTF-8 text or explicit Unicode escapes when there is any encoding risk.
  - After changing parser warnings, re-run the extractor and verify the final JSON, not just the source file.

## 2026-03-27 - ID card parser fallback rule

- Problem:
  - After parser changes around normalization and document-specific handling, the Bulgarian ID-card flow regressed and lost `фамилия`, `място_на_раждане`, and `постоянен_адрес`.
- Why it happened:
  - The parser relied too heavily on direct label matching and not enough on the stable visual order of the OCR blocks.
- Rule going forward:
  - For core fields on Bulgarian ID cards, always keep positional fallbacks in addition to label-based extraction.
  - When changing shared normalization logic, re-test both document types immediately: ID card and driving licence.
