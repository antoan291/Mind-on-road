# Version Journal

## v0.1.0 - Core knowledge layer initialized (2026-03-26)

- Created the reusable core folder structure.
- Copied local PDF and DOCX reference materials into core/materials.
- Registered long-term GitHub and documentation sources in core/source_registry.md.
- Started a reusable database research note set for future projects.
- Introduced version logging and error logging as mandatory project disciplines.

## v0.1.1 - DevOps source added (2026-03-26)

- Registered The DevOps Handbook as a permanent source in core/materials/books.
- Added core/research/devops_research.md to keep stable DevOps principles and future runbook expansion points.

## v0.1.2 - Node.js best practices source added (2026-03-26)

- Registered goldbergyoni/nodebestpractices as a permanent backend source.
- Added core/research/nodejs_best_practices.md to preserve Node.js architectural and operational principles for future backend work.

## v0.1.3 - Backend standards document added (2026-03-26)

- Added core/research/backend_architecture_standards.md as the combined backend source of truth.
- Consolidated Node.js, Clean Code, database, security and DevOps backend rules into one reusable standards file.

## v0.1.4 - Bulletproof Node.js source added (2026-03-26)

- Registered santiq/bulletproof-nodejs as an additional backend structure reference.
- Added core/research/bulletproof_nodejs_notes.md to preserve the structural lessons while filtering out outdated or mismatched stack choices.

## v0.2.0 - Backend skeleton created (2026-03-26)

- Created backend folder next to frontend as a Node.js modular monolith skeleton.
- Added tenant-aware bounded context structure under backend/src/modules.
- Added root backend scaffold files: README, package.json, tsconfig, env example, prisma schema placeholder and main.ts.
- Added config, common, infrastructure, jobs and test structure in line with the project architecture docs.
- Kept the structure aligned with backend_architecture_standards.md and the existing project architecture decisions.

## v0.2.1 - Backend structure hardened (2026-03-26)

- Added missing scaffold directories for bootstrap, shared context, filters, validation, infrastructure providers and job orchestration.
- Added backend structure guidance, naming conventions and module template documents.
- Added repo-level .editorconfig and .gitignore to improve UTF-8 discipline and keep the repository clean.
- Tightened backend README files so the structure is understandable for a new engineer before feature work begins.

## v0.2.2 - Framework-specific backend scaffold removed (2026-03-27)

- Removed framework-specific files, scripts and module decorators from the backend scaffold.
- Replaced old app/module entry files with a plain Node.js app definition and module registry structure.
- Updated backend docs and project notes so the backend standard is clearly plain Node.js.

## v0.2.3 - Express fixed as backend transport layer (2026-03-27)

- Updated backend and architecture documentation to state `Node.js + Express + TypeScript` explicitly.
- Clarified that the modular monolith and domain layering remain framework-agnostic above the Express transport layer.

## v0.3.0 - Automation document intelligence scaffold added (2026-03-27)

- Added a new `automation` folder next to frontend and backend for reusable automation workflows.
- Added a Python document-intelligence package for Bulgarian ID card and driving licence extraction from PDF scans.
- Added OpenAI vision + structured extraction pipeline, PDF rendering step, CLI wrapper, output folder and environment template.
- Recorded the automation layer as reusable project knowledge instead of leaving it only as chat context.

## v0.3.1 - Automation package installed and quota handling clarified (2026-03-27)

- Installed the local Python automation package in editable mode.
- Verified that the extractor reaches the OpenAI API with the provided test PDF.
- Reworked the CLI and extraction error handling to show a clear message for OpenAI quota failures instead of a raw traceback.

## v0.4.0 - Automation pipeline moved to offline PaddleOCR architecture (2026-03-27)

- Replaced the OpenAI-based extraction path with an offline PaddleOCR OCR engine and local rule-based parser.
- Removed OpenAI configuration from the automation package and replaced it with PaddleOCR configuration.
- Updated the README and environment template to document the offline setup and execution flow.

## v0.4.1 - PaddleOCR runtime pinned for Windows stability (2026-03-27)

- Identified a runtime incompatibility in the latest PaddleOCR/PaddlePaddle combination on Windows.
- Pinned the automation documentation and package guidance to a more stable OCR runtime combination.

## v0.4.2 - Offline OCR pipeline verified end to end (2026-03-27)

- Installed the pinned PaddleOCR and PaddlePaddle runtime successfully.
- Verified end-to-end execution of the offline document extractor on `test-docs/id-card.pdf`.
- Confirmed JSON output generation in `automation/output/id-card.json`.
- Narrowed the remaining work to field-quality tuning for specific Bulgarian ID-card layouts instead of system-level runtime failures.

## v0.4.3 - Bulgarian ID parser quality improved (2026-03-27)

- Tuned the parser against the real OCR output of the test Bulgarian ID card.
- Fixed extraction of first name, place of birth and address cleanup.
- Added address-fragment filtering and place-name normalization to reduce OCR noise in the final JSON.

## v0.4.4 - Driving licence parser added (2026-03-27)

- Added separate parser rules for Bulgarian driving licences instead of reusing the ID-card layout rules.
- Fixed extraction of first name, surname, EGN, document number and place of birth for the tested driving-licence sample.
- Removed false warnings for fields that are not reliably present on the driving-licence layout.
## 2026-03-27 - Automation OCR tuning for driving licence names

- Fixed the Bulgarian driving-licence parser so `име`, `презиме`, and `фамилия` are extracted from the correct OCR block between field markers `2` and `3`.
- Replaced the fragile generic name guessing with positional block parsing for licence names.
- Added safer normalization for Latin lookalike characters so OCR values like `ATAHACOBA` normalize correctly to `АТАНАСОВА`.
- Re-ran the offline extractor for `car-card.pdf` and verified the output now includes:
  - `име: ДИЯНА`
  - `презиме: АТАНАСОВА`
  - `фамилия: ДИМИТРОВА`
  - `място_на_раждане: ВАРНА`
- Added an explicit warning for `постоянен_адрес` on driving licences so the output explains when the address is not extractable from the scanned document instead of silently leaving only `null`.
- Added `категории` extraction for Bulgarian driving licences, including OCR-based date linking from the back side.
- Verified the current sample now returns categories `AM`, `B1`, and `B` with date `09.03.05`.
- Replaced broken mojibake warning literals in the automation parser so JSON warnings now render correctly in Bulgarian.
- Restored the Bulgarian ID-card parser with positional fallbacks for `фамилия`, `място_на_раждане`, and `постоянен_адрес`.
- Re-ran `id-card.pdf` and verified the output again returns:
  - `фамилия: ДИМИТРОВА`
  - `място_на_раждане: ВАРНА`
  - `постоянен_адрес: ЖК.МЛАДОСТ 123 вх.1 ет.5 ап.15`
