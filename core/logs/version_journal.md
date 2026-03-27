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
