# Version Journal

## v0.1.0 - Core knowledge layer initialized (2026-03-26)

- Created the reusable core folder structure.
- Copied local PDF reference materials into `agent/architecture/materials/` and `agent/backend/materials/` where relevant.
- Registered long-term GitHub and documentation sources in `agent/source_registry.md`.
- Started a reusable database research note set for future projects.
- Introduced version logging and error logging as mandatory project disciplines.

## v0.1.1 - DevOps source added (2026-03-26)

- Registered The DevOps Handbook as a permanent source in `agent/architecture/materials/books/`.
- Added `agent/architecture/research/devops_research.md` to keep stable DevOps principles and future runbook expansion points.

## v0.1.2 - Node.js best practices source added (2026-03-26)

- Registered goldbergyoni/nodebestpractices as a permanent backend source.
- Added `agent/backend/research/nodejs_best_practices.md` to preserve Node.js architectural and operational principles for future backend work.

## v0.1.3 - Backend standards document added (2026-03-26)

- Added `agent/backend/research/backend_architecture_standards.md` as the combined backend source of truth.
- Consolidated Node.js, Clean Code, database, security and DevOps backend rules into one reusable standards file.

## v0.1.4 - Bulletproof Node.js source added (2026-03-26)

- Registered santiq/bulletproof-nodejs as an additional backend structure reference.
- Added `agent/backend/research/bulletproof_nodejs_notes.md` to preserve the structural lessons while filtering out outdated or mismatched stack choices.

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

- Fixed the Bulgarian driving-licence parser so `first_name`, `middle_name`, and `surname` are extracted from the correct OCR block between field markers `2` and `3`.
- Replaced the fragile generic name guessing with positional block parsing for licence names.
- Added safer normalization for Latin lookalike characters so OCR values like `ATAHACOBA` normalize correctly to `ATANASOVA`.
- Re-ran the offline extractor for `car-card.pdf` and verified the output now includes:
  - `first_name: DIYANA`
  - `middle_name: ATANASOVA`
  - `surname: DIMITROVA`
  - `place_of_birth: VARNA`
- Added an explicit warning for `permanent_address` on driving licences so the output explains when the address is not extractable from the scanned document instead of silently leaving only `null`.
- Added `categories` extraction for Bulgarian driving licences, including OCR-based date linking from the back side.
- Verified the current sample now returns categories `AM`, `B1`, and `B` with date `09.03.05`.
- Replaced broken mojibake warning literals in the automation parser so JSON warnings now render correctly in Bulgarian.
- Restored the Bulgarian ID-card parser with positional fallbacks for `surname`, `place_of_birth`, and `permanent_address`.
- Re-ran `id-card.pdf` and verified the output again returns:
  - `surname: DIMITROVA`
  - `place_of_birth: VARNA`
  - `permanent_address: JK MLADOST 123 vh.1 et.5 ap.15`
- Updated the dashboard quick actions so they now open dialogs instead of behaving like bare navigation shortcuts.
## 2026-03-28 - OCR parser constant cleanup

- Verified `automation/src/document_intelligence/text_parser.py` for hidden encoding regressions.
- Removed broken duplicate constants such as `LATIN_LOOKALIKE_MAP` and `KNOWN_BULGARIAN_PLACES`.
- Normalized the address token lists to Unicode-safe literals only.
- Goal: keep the parser maintainable and prevent future OCR regressions caused by mojibake constants.

## 2026-03-28 - Automation hardening pass

- Cleaned `automation/src/document_intelligence/text_parser.py` from remaining parser-critical mojibake strings.
- Re-verified the OCR pipeline with both sample documents:
  - `test-docs/id-card.pdf`
  - `test-docs/car-card.pdf`
- Confirmed valid structured outputs in:
  - `automation/output/id-card.json`
  - `automation/output/car-card.json`
- Rewrote `automation/README.md` cleanly and added Python artifact ignore rules in the root `.gitignore`.

## 2026-03-28 - Dashboard UTF-8 rewrite

- Replaced `frontend/src/app/pages/DashboardPage.tsx` with a clean UTF-8 implementation.
- Preserved the dashboard role and the quick-action dialog flow.
- Removed the corrupted Bulgarian text and verified that the file no longer contains mojibake characters.

## 2026-03-28 - Dashboard quick action dialog wiring

- Replaced the old placeholder quick-action modal in frontend/src/app/pages/DashboardPage.tsx with the dedicated DashboardQuickActionDialog component.
- Dashboard quick actions now use a single dialog implementation and route-ready confirm handling.

## 2026-03-28 - Financial detail drawers aligned with practice layout

- Updated Payments and Invoices detail drawers to use the same right-side slide-over shell pattern as PracticalLessons.
- The page now remains visible behind the drawer instead of feeling replaced by a fullscreen panel.

- 2026-03-28: Cleaned new frontend edit-dialog regressions in Payments and Invoices and removed literal `????` placeholders from the affected TSX files.
- 2026-03-28: Added a real edit dialog to PracticalLessonsPage with editable practice lesson fields, stateful save flow, and Unicode-safe frontend labels.
- 2026-03-28: Reworked InstructorsPage into a card-style grid with larger rounded instructor cards and preserved visible document/payment alert signals inside each card.

## 2026-03-28 - Instructor and vehicle cards polish
- Reworked the instructor cards into cleaner rounded tiles with grouped info, document status, and payment status blocks.
- Reworked the vehicles page to use rounded vehicle cards as the main presentation instead of the older list-style section.
- Rewrote both pages in clean UTF-8 so the UI no longer shows broken question-mark text or escaped unicode strings.

## 2026-03-28 - AI Center redesign
- Reworked AIPage into a tabbed AI workspace with Risk, Business Assistant, and Document Review views.
- Aligned the page more closely with the provided references while keeping it optimized for admin-heavy use and dark-theme consistency.
- Introduced a top AI workspace tab bar and rebuilt the page around action-first panels instead of generic cards.

## 2026-03-28 - Dashboard finance statistics
- Added a new finance overview section under the top alerts on Dashboard.
- The dashboard finance section now reads from the same reporting data source as Reports and supports day, month, and year filtering.
- Added a Shopify-style overview card with current profit/loss, period comparison, and compact revenue/expense trend bars.

## 2026-03-28 - Root cleanup
- Removed temporary helper scripts and text files that had been left in the project root during earlier frontend fixes.

## 2026-04-08 - Personnel and role model refactor
- Replaced the old school-level `admin` role with the clearer split `Собственик`, `Администрация`, `Инструктор`, and `Инструктор симулатор`.
- Added a full-access `developer` role intended for platform development and debugging without overloading the owner position.
- Introduced a shared `Персонал` management flow for school staff creation and multi-specialty assignments.
- Updated the tenant bootstrap/runtime setup so the owner keeps full school access and a separate developer account can also access all modules.

## 2026-04-08 - Personnel password ownership
- Locked the `Персонал` edit flow so owners and developers can no longer change an employee password from the management screen.
- Kept password entry only on staff creation and made edit mode explicitly instruct the employee to change their own password after login.
- Added backend protection and integration coverage so `PUT /personnel/:membershipId` rejects password updates and preserves the existing login credentials.

## 2026-04-08 - Personnel deletion removes login access
- Added owner/developer staff deletion through `Персонал` with a dedicated destructive action in the employee edit modal.
- Deleting a staff member now removes the tenant membership, revokes their active session in that school, and deletes the underlying user/login record when no other memberships remain.
- Added integration coverage that confirms a deleted employee can no longer log in with the old credentials.

## 2026-04-08 - Determinator restricted to administration
- Removed `Детерминатор` access for `Инструктор` and `Инструктор симулатор`.
- The screen is now hidden from instructor navigation and student detail tabs, and the route/UI guard allows only `Собственик`, `Разработчик`, and `Администрация`.
- Backend authorization now returns `403` for instructor calls to the determinator endpoints, with integration coverage for both GET and POST access attempts.

## 2026-04-08 - Instructor dashboard reduced to operational alerts
- Reworked the instructor dashboard into a minimal operational view with only instructor-relevant alerts for assigned students and scoped vehicles.
- Removed school-wide financial overview, profit statistics, and the extra dashboard quick actions from the instructor experience.
- Kept a single quick action `Запиши час`, with the lesson dialog constrained to the instructor’s own context.

## 2026-04-08 - Frontend route code splitting
- Reworked the frontend router to lazy-load page modules instead of shipping all screens in the initial bundle.
- Added explicit Vite vendor chunk splitting for router, MUI, Radix, charts, and icons so heavy dependencies no longer accumulate in one monolithic JS file.
- Removed the oversized frontend bundle warning from the production build and reduced initial entry cost to a small shell plus route chunks.

## 2026-04-08 - Administration access narrowed
- Removed `Администрация` access to `Персонал` and `AI център` in both the navigation and route guards.
- Locked backend `personnel` and `ai/business-assistant` endpoints to `Собственик` and `Разработчик`, so legacy permissions in older seeded roles no longer bypass the product rule.
- Removed `users.manage` from the administration role template for future tenant seeds and added integration coverage for `403` on both restricted areas.

## 2026-04-08 - Student form uses live instructors and theory groups
- Replaced the hardcoded instructor names in the student create/edit form with tenant-scoped API data.
- Added a dedicated `GET /students/instructor-options` endpoint so `Собственик`, `Разработчик`, and `Администрация` can assign instructors without exposing the full `Персонал` registry.
- Replaced the hardcoded theory group list in the same form with live theory groups and added integration coverage for the new instructor-options endpoint.

## 2026-04-08 - Instructor document expiry notifications
- Extended the generated notifications feed with `INSTRUCTOR_DOCUMENT_EXPIRY` signals sourced from live document records instead of frontend-only heuristics.
- Synced the notifications repository to delete stale generated rows so the bell state and notifications page reflect the current source-of-truth state.
- Wired the dashboard and top bell to the real notifications feed, so expiring instructor documents now surface in both places and the bell turns red only when pending notifications exist.

## 2026-04-08 - Shared frontend notifications state
- Added a dedicated frontend notifications provider so the bell, dashboard, notifications pages, and portal views all consume the same cached notification state.
- Replaced repeated page-level notification fetches with one shared refresh/polling flow to reduce drift between screens.
- Kept the unread bell indicator driven by the real backend `PENDING` notifications instead of local component state.

## 2026-04-08 - Student registration dates and initial payment flow
- Replaced scattered native/browser date inputs in the shared and ui-system field layers with one reusable calendar popover component, so student registration and theory-group dialogs now use the same date picker behavior.
- Changed student registration so the initial paid amount creates a real payment record during `POST /students`, instead of being hidden inside enrollment notes.
- Updated the student dossier to show unmasked EGN, correct hour labels (`Закупени`, `Проведени`, `Остават`), and real paid/remaining euro totals from payment records.

## 2026-04-08 - Student portal credentials set at registration
- Changed student registration so the owner/developer sets the course participant's portal email and password explicitly during `POST /students`, instead of relying on an autogenerated temporary password.
- Kept the security rule that the student must change that password after the first successful login, while blocking owner-side password changes during later student edits.
- Fixed the identity-linking bug that could overwrite an instructor account when a student reused the same phone number, by allowing account reuse only by exact email and never by phone.
