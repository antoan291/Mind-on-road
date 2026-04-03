# Индекс на документацията

## 1. Purpose

Този файл е legacy индекс на документацията. Каноничната входна точка вече е [docs/README.md](README.md).

Its job is simple:

- show which documents are official;
- show what each document is for;
- tell the reader in what order to read them;
- keep `docs` strict and understandable.

## 2. Reading Order

For a new person joining the project, the recommended reading order is:

1. [strict_project_documentation.md](product/strict_project_documentation.md)
2. [user_roles_matrix.md](product/user_roles_matrix.md)
3. [business_plan.md](product/business_plan.md)
4. [system_architecture.md](architecture/system_architecture.md)
5. [tech_stack_architecture.md](architecture/tech_stack_architecture.md)
6. [database_architecture.md](architecture/database_architecture.md)
7. [legacy_school_data_reconciliation.md](architecture/legacy_school_data_reconciliation.md)
8. [security_architecture.md](architecture/security_architecture.md)
9. [backup_and_disaster_recovery.md](architecture/backup_and_disaster_recovery.md)
10. [platform_admin_feature_management.md](product/platform_admin_feature_management.md)
11. [automation_strategy.md](automation/automation_strategy.md)
12. [automation_research_and_regulatory_notes.md](automation/automation_research_and_regulatory_notes.md)
13. [development_execution_playbook.md](delivery/development_execution_playbook.md)
14. [design_prompts.md](delivery/design_prompts.md)

## 3. Official Source-of-Truth Documents

### 3.1 Product

- [strict_project_documentation.md](product/strict_project_documentation.md)
  Defines the business scope, product logic, main modules, and operating rules.

- [user_roles_matrix.md](product/user_roles_matrix.md)
  Defines the roles, permissions, and tenant-scoped access model.

- [business_plan.md](product/business_plan.md)
  Defines the business vision, customer value, product scope, monetization logic, rollout model, and long-term product direction.

### 3.2 Architecture

- [system_architecture.md](architecture/system_architecture.md)
  Defines the high-level system architecture and module direction.

- [tech_stack_architecture.md](architecture/tech_stack_architecture.md)
  Defines the chosen stack and key technical decisions.

- [database_architecture.md](architecture/database_architecture.md)
  Defines the database strategy, tenant modeling, and data integrity direction.

- [legacy_school_data_reconciliation.md](architecture/legacy_school_data_reconciliation.md)
  Reconciles the real legacy school workbooks with the target product model and identifies missing data structures.

- [security_architecture.md](architecture/security_architecture.md)
  Defines access control, sensitive-data handling, and security defaults.

- [backup_and_disaster_recovery.md](architecture/backup_and_disaster_recovery.md)
  Defines backup, restore, and disaster-recovery expectations.

### 3.3 Platform Control

- [platform_admin_feature_management.md](product/platform_admin_feature_management.md)
  Defines how the platform admin enables or disables paid functionality per driving school.

### 3.4 Automation

- [automation_strategy.md](automation/automation_strategy.md)
  Defines the target automation model for the business.

- [automation_research_and_regulatory_notes.md](automation/automation_research_and_regulatory_notes.md)
  Adds official Bulgarian regulatory research and global market research to the automation strategy.

### 3.5 Delivery

- [development_execution_playbook.md](delivery/development_execution_playbook.md)
  Defines how the product should be built step by step, from static frontend to production delivery.

### 3.6 Design

- [design_prompts.md](delivery/design_prompts.md)
  Contains the AI-assisted design prompts and design-system direction.

## 4. Implementation Knowledge Folders

These are implementation-support folders inside `docs`. They are not the top-level product source of truth, but they are serious working libraries for frontend and backend execution.

- [docs/delivery/frontend/README.md](delivery/frontend/README.md)
- [docs/delivery/backend/README.md](delivery/backend/README.md)

## 5. What Is Not Kept in `docs`

The `docs` folder is for project-facing source-of-truth documents.

Internal working memory, source lists, books, and research notes belong in:

- [agent/README.md](../agent/README.md)
- [agent/source_registry.md](../agent/source_registry.md)
- [agent/backend/research/backend_architecture_standards.md](../agent/backend/research/backend_architecture_standards.md)

## 6. Folder Rule

If a new document is created:

- put it in `docs` only if it is a real project source-of-truth document;
- put it in `core` if it is internal research, notes, books, or long-term engineering memory;
- avoid creating one-file documents for ideas that already belong inside an existing source-of-truth document.
