# Legacy School Data Reconciliation

## Purpose

This document reconciles two real legacy school workbooks with the current MindOnRoad product model:

- [otchet-vili.xlsx](../artifacts/otcheti/otchet-vili.xlsx)
- [register-silvi-ins.xlsx](../artifacts/otcheti/register-silvi-ins.xlsx)

Its goal is to identify:

- which legacy fields are genuinely required in the product;
- which legacy columns are mixed, duplicated, or operationally noisy;
- which structures were under-modeled in the current docs;
- how the legacy school process should map into a cleaner product model.

## High-level conclusion

The two files represent two different realities:

- `register-silvi-ins.xlsx` is the strongest source for student-training lifecycle and regulatory/compliance tracking.
- `otchet-vili.xlsx` is not a clean payments table. It is a mixed weekly financial ledger that combines student income, fees, cash-box totals, and business expenses in one operational report.

Because of that:

- the instructor register should influence `students`, `enrollments`, `training milestones`, and `certificate/compliance` structures;
- the weekly report should influence `reporting` and `cash ledger` structures, not only `payments`.

## Legacy register findings

The instructor register consistently contains the following business data that the product must support.

### Core student identity

- full name
- national identifier (`EGN`)
- phone
- training category
- start date of training
- training group / group number

### Training lifecycle and milestones

- theory completion marker/date (`виТ` / `прикл. теория`)
- theory exam marker/date (`Т-ДАИ`)
- practical completion marker/date (`виП` / `прикл. практика`)
- practical exam marker/date (`П-ДАИ`)
- extra hours count
- extra-hours price / surcharge logic
- assigned instructor
- course completion status
- canceled / withdrawn / refused status

### Compliance / administrative tracking

- insurance marker
- paper vs electronic mode
- education level
- birthplace city / municipality / district
- address
- training diary number
- protocol number
- protocol date
- certificate issue date
- CPO-specific completion markers
- theory-only / no-CPO flags in older sheets

### Financial linkage inside the register

The 2026 workbook adds a more explicit financial breakdown:

- one student can have multiple invoice rows / installment references;
- each installment has document reference, date, amount, and fee;
- course price is sometimes written as a free-form formula;
- totals are mixed with narrative notes.

This means the register should not be the accounting source of truth, but it proves the need for:

- enrollment-level price plan;
- installment / receivable schedule;
- linked invoice references;
- fee tracking separate from tuition.

## Weekly finance workbook findings

The weekly report workbook is structurally important, but it is not normalized.

It mixes:

- student training payments;
- DAI-related theory / practice fee buckets;
- operational expenses like fuel, courier, inspections, transfers;
- cash-box totals;
- payments in both BGN and EUR;
- notes about who received the money;
- corrections, reversals, and ad-hoc manual comments.

### What must be modeled from it

- a reporting ledger with both income and expense entries;
- original currency and normalized base-currency amount;
- document reference / invoice number when present;
- free-text note / operational comment;
- counterparty / payer / recipient;
- transaction classification:
  - student payment
  - fee
  - expense
  - transfer
  - correction
- weekly reporting period
- cash-vs-bank-vs-POS method

### What should not be copied directly as product structure

- hard-coded spreadsheet side buckets such as repeated summary cells on the right;
- mixed formulas and text in the same amount field;
- visual weekly layout artifacts;
- duplicated summary rows like `КОСТОВА`, cash-box totals, or side notes as if they were normal student payments.

These should be re-modeled into:

- proper ledger entries;
- ledger summaries;
- reporting views;
- business rules for classification.

## Required product structures added by this reconciliation

The current project model should explicitly support:

### Student training enrollment

- `training_start_date`
- `training_group_code`
- `training_category`
- `assigned_instructor_id`
- `course_outcome`
- `withdrawal_reason`

### Training milestones

- `theory_completed_at`
- `theory_exam_at`
- `practical_completed_at`
- `practical_exam_at`
- `extra_hours_count`
- `extra_hours_unit_price`

### Student compliance profile

- `national_id`
- `education_level`
- `birth_place_city`
- `birth_place_municipality`
- `birth_place_region`
- `address_text`
- `insurance_status`
- `record_mode` (`paper`, `electronic`, `hybrid`)

### Certification / register tracking

- `training_diary_number`
- `protocol_number`
- `protocol_date`
- `certificate_issued_at`
- `cpo_completion_status`
- `theory_only_flag`
- `without_cpo_flag`

### Finance and reporting

- `ledger_entries`
- `ledger_entry_allocations` when one financial movement must be split
- `ledger_reporting_periods`
- `original_currency`
- `original_amount`
- `base_currency_amount`
- `document_reference`
- `counterparty_name`
- `entry_note`
- `entry_classification`

## Product interpretation rules

To combine your product ideas with the legacy school data correctly:

- keep the legacy files as discovery input, not as schema templates;
- preserve every field that has compliance, student-lifecycle, or accounting value;
- normalize free-form spreadsheet practices into explicit domain fields;
- keep ad-hoc comments as notes, not as overloaded core fields;
- separate student enrollment data from ledger data;
- separate tuition / installments from business expenses;
- never treat spreadsheet visual sections as database entities.

## Student portal registration rule

The school workflow should assume that student portal access is created as part of the administrative student-registration process.

Operational interpretation:

- administration registers the student and fills the official business data;
- the student's phone number becomes the initial portal username;
- the system generates a random temporary password;
- the student receives these credentials through a controlled handoff process;
- the student must change the temporary password at first login.

This rule fits the real school process better than asking administration to separately create every student account by hand.

It also means the product must support:

- normalized phone-based usernames;
- temporary credential issuance tracking;
- forced password change on first login;
- student self-scope portal access separate from staff roles.

## Columns likely to be unnecessary or non-canonical

The following patterns should not become first-class database columns without stronger justification:

- repeated weekly side summaries embedded in the same sheet;
- cells used only for spreadsheet formulas or visual alignment;
- mixed text like `ПОС 171.28 €` inside amount fields;
- hard-coded operator names inside note cells when they represent a transaction actor better modeled separately;
- duplicate completion markers expressed in several inconsistent ways across years.

These are still useful for migration and audit review, but not as final domain structure.

## Frontend implication

The frontend should visibly support at least:

- student group number;
- national identifier in masked form;
- instructor assignment;
- training stage / milestone summary;
- extra-hours indicator;
- completion / withdrawn status;
- reporting rows that show document reference, counterparty, purpose, note, currency, and entry type.

## Decision

The legacy files reveal that the current project documentation was missing part of the compliance and register layer, and was under-modeling the difference between:

- `payments`
- `installments / receivables`
- `reporting ledger entries`

This document is now part of the project source-of-truth and should be read together with:

- [database_architecture.md](database_architecture.md)
- [strict_project_documentation.md](../product/strict_project_documentation.md)
- [security_architecture.md](security_architecture.md)
