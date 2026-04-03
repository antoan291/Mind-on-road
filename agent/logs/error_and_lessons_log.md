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
  - `permanent_address` stayed `null` for the driving licence output and this looked like a parser miss.
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
  - After parser changes around normalization and document-specific handling, the Bulgarian ID-card flow regressed and lost `surname`, `place_of_birth`, and `permanent_address`.
- Why it happened:
  - The parser relied too heavily on direct label matching and not enough on the stable visual order of the OCR blocks.
- Rule going forward:
  - For core fields on Bulgarian ID cards, always keep positional fallbacks in addition to label-based extraction.
  - When changing shared normalization logic, re-test both document types immediately: ID card and driving licence.

## 2026-03-27 - Dashboard quick actions UX rule

- Requirement:
  - Quick actions on the dashboard must open a dialog first, because their purpose is fast guided action, not abrupt navigation.
- Rule going forward:
  - When a feature is named `Quick Actions`, treat it as a guided modal entry point unless the screen explicitly requires direct execution.

## 2026-03-28 - Remove broken duplicate constants from OCR parser

- Problem:
  - `text_parser.py` still contained mojibake constants like `LATIN_LOOKALIKE_MAP`, `KNOWN_BULGARIAN_PLACES`, and broken address token lists, even though safer Unicode-based versions also existed.
- Why it matters:
  - Even unused corrupted constants are dangerous because they confuse maintenance, increase the chance of future regressions, and make the parser look unreliable.
- Fix:
  - Removed the broken duplicate constants and kept only the Unicode-safe maps and token lists.
  - Replaced the address token lists with explicit Unicode-safe literals.
- Rule going forward:
  - Do not keep parallel “broken” and “safe” constants in the same parser.
  - When mojibake appears in a source file, remove the corrupted variant entirely instead of leaving it as dead code.

## 2026-03-28 - Full automation Unicode cleanup

- Problem:
  - The automation layer still had parser-critical mojibake strings in label matching, document-type detection, address normalization, and README instructions.
- Why it matters:
  - In OCR workflows, broken label strings do not just look ugly; they can silently break extraction rules for fields like `first_name`, `surname`, `id_card`, and `permanent_address`.
- Fix:
  - Replaced all parser-critical Bulgarian literals with Unicode-safe strings.
  - Rewrote the automation README cleanly in UTF-8.
  - Added ignore rules for Python generated artifacts under `automation`.
- Rule going forward:
  - Treat OCR parser labels as core logic, not incidental text.
  - After any parser cleanup, verify both syntax and real sample outputs for ID card and driving licence.

## 2026-03-28 - Driving licence address rule

- Requirement:
  - When the document is a Bulgarian driving licence, `permanent_address` is not a required field for the extractor output.
- Fix:
  - Removed the automatic warning for missing permanent address in the driving-licence branch.
- Rule going forward:
  - Document-specific optional fields must stay `null` without being reported as extraction failures when the field is not expected on that document type.

## 2026-03-28 - Dashboard mojibake regression

- Problem:
  - `frontend/src/app/pages/DashboardPage.tsx` was left with widespread mojibake and the whole dashboard became unreadable.
- Why it happened:
  - Incremental edits were applied on top of an already corrupted file instead of replacing the file with a clean UTF-8 source of truth.
- Fix:
  - Rewrote the dashboard page completely in clean UTF-8.
  - Reduced the page to a smaller, clearer structure instead of patching the broken content in place.
- Rule going forward:
  - When a UI file shows widespread mojibake, do not patch it line by line.
  - Replace the entire file with a clean UTF-8 version and then verify that no mojibake characters remain.

## 2026-03-28 - Dashboard dialog implementation rule

- Problem:
  - The dashboard still contained an old placeholder modal even after a dedicated quick-action dialog component existed.
- Fix:
  - Wired the page to a single dedicated dialog component and removed the duplicate placeholder modal flow.
- Rule going forward:
  - Do not keep two dialog implementations for the same dashboard action flow. Use one dedicated component and evolve it in place.

## 2026-03-28 - Detail drawer layout consistency

- Requirement:
  - Financial detail panels should follow the same right-side slide-over pattern as the practice page, with the originating page still visible behind them.
- Rule going forward:
  - For detail views opened from list pages, reuse the shared slide-over layout pattern instead of mixing fullscreen replacement and drawer styles across modules.
- 2026-03-28: After frontend text edits, always search frontend/src for `????` and fix remaining labels before stopping.
- 2026-03-28: For large TSX files on this Windows workspace, write new Bulgarian UI strings either as JSX unicode escape literals or verify with a grep pass for question-mark regressions before stopping.
- 2026-03-28: For Windows frontend edits, panel titles and subtitles should also be written through Unicode-safe strings when a direct Bulgarian save regresses to question marks.
- 2026-03-28: If a JSX prop in frontend uses unicode escapes, it must be written as an expression (for example title={'\u....'}) and never as a plain quoted string, otherwise the UI prints the escapes literally.

## Frontend Unicode and large-page edits
- If a large TSX page starts showing broken labels, question marks, or literal unicode escapes, stop patching line by line and rewrite the full page in clean UTF-8.
- After UI text changes, always search the touched area for question-mark placeholders and unicode-escape regressions before considering the task done.

## AI center UI work
- Large page rewrites must be done in smaller stable chunks in this Windows environment; otherwise the write may timeout and leave the file incomplete.
- When a page is a strategic workspace, prefer task-oriented tabs and action panels over generic metric-card stacks.

## Dashboard finance module
- For larger UI additions in this environment, isolate the feature into a separate component and wire it into the page with small edits instead of rewriting the full page.
- When template literals appear inside style props, verify the exact saved source because PowerShell string replacement may strip braces or backticks.

## Root temp files
- Temporary helper scripts and scratch text files must never stay in the workspace root after a task. Clean them immediately or place them in a dedicated temp/support location.
