# Automation Strategy

## 1. Goal

The strategic goal of the platform is simple:

- one platform;
- one operational truth;
- minimum manual work;
- maximum safe automation;
- human approval only where money, legal risk, or safety require it.

The best version of this business is not just a digital driving school. It is an operational control system that:

- collects data once;
- reuses it everywhere;
- triggers workflows automatically;
- warns early;
- documents everything;
- helps the owner, administration, and instructors work with fewer clicks and fewer mistakes.

For the regulatory and market-research framing behind this strategy, see [automation_research_and_regulatory_notes.md](automation_research_and_regulatory_notes.md).

## 2. Automation Principles

All automation in this product should follow these rules:

- `event-driven`: actions start from real business events such as payment received, lesson completed, document uploaded, or attendance saved.
- `tenant-aware`: every automation runs only inside the current driving school's data scope.
- `auditable`: every automated action must leave a trace in audit logs.
- `reversible`: important automated outcomes should support correction or follow-up actions.
- `human-in-the-loop`: legal, financial, and OCR-sensitive actions should support review before final save when confidence is low.
- `idempotent`: retries must not create duplicate invoices, reminders, or records.
- `configurable`: each school can enable or disable modules and automation rules depending on the paid plan.

## 3. Highest-Value Automation Areas

### 3.1 Lead and Enrollment Automation

What can be automated:

- lead capture from web form, phone intake, or admin quick action;
- automatic student draft profile creation;
- automatic assignment to the right category and theory group suggestions;
- automatic onboarding checklist;
- automatic missing-data reminders;
- automatic contract/document request flow.

How to do it:

- trigger from `new lead created` or `new student started`;
- create student draft record;
- generate onboarding tasks;
- request required documents;
- assign status like `new`, `waiting for documents`, `ready for theory`, `ready for practice`.

Business effect:

- less manual data re-entry;
- faster onboarding;
- fewer forgotten steps.

### 3.2 Document Automation

What can be automated:

- upload of ID card or driving license;
- OCR extraction of names, EGN, document number, birth place, address, or license categories;
- expiry date tracking;
- missing document detection;
- document completeness checks;
- document reminders before expiry;
- school, instructor, and vehicle document monitoring.

How to do it:

- upload document;
- run OCR pipeline;
- extract structured data;
- save as draft if confidence is low;
- compare against existing profile;
- create warnings for mismatch or missing fields;
- trigger reminders for expiring documents.

Business effect:

- less typing;
- less missing paperwork;
- faster compliance control.

### 3.3 Theory Attendance Automation

What can be automated:

- pre-fill attendance list for the selected theory group;
- save attendance with one final button;
- auto-calculate absences;
- auto-detect students who need recovery hours;
- auto-send absence notifications;
- auto-update theory progress;
- auto-mark student as eligible for next step after required attendance is completed.

How to do it:

- trigger from `attendance saved`;
- store present / absent / excused status;
- recalculate theory progress;
- create follow-up tasks for missing classes;
- notify administration and optionally the student.

Business effect:

- no forgotten attendance updates;
- cleaner compliance records;
- better student follow-up.

### 3.4 Practice Scheduling Automation

What can be automated:

- suggest best lesson slots by instructor, vehicle, and student availability;
- detect scheduling conflicts automatically;
- detect underused or overloaded instructors;
- auto-suggest replacement vehicle or instructor when one becomes unavailable;
- reschedule chains after cancellation;
- auto-generate instructor day plan.

How to do it:

- trigger from `lesson requested`, `lesson canceled`, `vehicle unavailable`, or `instructor unavailable`;
- check instructor calendar;
- check vehicle calendar;
- apply conflict rules;
- suggest top replacement options;
- optionally create notification drafts.

Business effect:

- faster scheduling;
- fewer manual calendar repairs;
- better resource use.

### 3.5 Lesson Completion Automation

What can be automated:

- after lesson end, open instructor feedback flow;
- after lesson end, open student feedback flow;
- update completed hours automatically;
- update remaining paid hours automatically;
- generate follow-up action if student missed the lesson;
- push notes into the student profile.

How to do it:

- trigger from `lesson marked completed` or `lesson marked missed`;
- increment progress counters;
- update lesson history;
- create next recommended step;
- add alerts if payment is low or documents are expiring.

Business effect:

- accurate progress;
- automatic learning history;
- less admin reconciliation.

### 3.6 Payment Automation

What can be automated:

- payment registration suggestions;
- automatic overdue detection;
- automatic reminder schedule;
- split-payment and installment tracking;
- payment-to-invoice linking;
- automatic dashboard and reports updates;
- late-payment risk scoring.

How to do it:

- trigger from `payment created`, `payment updated`, `payment overdue`, or `invoice linked`;
- recalculate totals and remaining amounts;
- schedule reminders at defined day offsets;
- mark overdue records;
- create owner/admin alerts for risky cases.

Business effect:

- less unpaid revenue;
- better payment visibility;
- fewer manual reminder calls.

### 3.7 Invoice Automation

What can be automated:

- draft invoice generation from payment or package selection;
- VAT/subtotal/total calculation;
- invoice numbering;
- payment link validation;
- anomaly checks on amount or missing invoice data;
- PDF generation;
- email sending;
- status transitions like `draft`, `issued`, `canceled`, `corrected`.

How to do it:

- trigger from `payment approved` or manual `create invoice` flow;
- prefill invoice data from student, package, and payment;
- run validation rules;
- generate PDF;
- store activity timeline;
- optionally send immediately or keep for approval.

Business effect:

- cleaner finance operations;
- fewer invoice mistakes;
- faster billing.

### 3.8 Notification Automation

What can be automated:

- payment reminders;
- lesson reminders;
- theory reminders;
- document expiry alerts;
- instructor reminders;
- owner summary notifications;
- internal admin alerts.

How to do it:

- one notification engine with templates;
- triggers by event type;
- configurable channels like in-app, email, SMS, or messaging integrations later;
- retry and delivery logging.

Business effect:

- fewer missed lessons;
- fewer overdue payments;
- better communication quality.

### 3.9 Vehicle and Instructor Compliance Automation

What can be automated:

- expiry checks for vehicle documents;
- expiry checks for instructor documents and certificates;
- automatic block or warning when critical document is expired;
- replacement suggestions for affected schedules;
- compliance dashboard cards.

How to do it:

- daily job scans documents by expiry threshold;
- create warnings at configurable intervals like `30 / 14 / 7 / 1 days`;
- if critical document is expired, mark vehicle or instructor as restricted for scheduling.

Business effect:

- less legal risk;
- less schedule disruption;
- stronger operational control.

### 3.10 Reporting Automation

What can be automated:

- daily, monthly, and yearly financial summaries;
- profit/loss calculation;
- trend cards from the same report entries;
- top overdue students;
- instructor utilization;
- vehicle utilization;
- theory attendance trend;
- dropout risk summary.

How to do it:

- derive read models from payments, invoices, lessons, attendance, and documents;
- use shared reporting data contracts;
- update aggregates after every important financial or lesson event;
- keep dashboard and reports aligned to the same data source.

Business effect:

- fewer manual Excel exports;
- one trusted financial and operational view.

### 3.11 Risk of Dropout Automation

What can be automated:

- student inactivity detection;
- repeated cancellations detection;
- payment delay influence;
- theory absence influence;
- drop in lesson frequency;
- suggested intervention actions.

How to do it:

- daily scoring job;
- weighted risk model using attendance, payment delay, lesson frequency, and cancellation history;
- classify into `low`, `medium`, `high` risk;
- create admin tasks like call student, offer reschedule, offer recovery lesson.

Business effect:

- reduced dropout;
- better retention;
- earlier intervention.

### 3.12 Business Assistant Automation

What can be automated:

- owner/admin AI assistant over school data;
- weekly summaries;
- bottleneck analysis;
- recommendations like rescheduling, payment follow-up, utilization balancing;
- query-to-insight workflows.

How to do it:

- tenant-scoped retrieval only;
- read from reporting views and operational tables;
- no cross-tenant memory;
- explainable recommendations;
- action suggestions should link to real pages like payments, schedule, or documents.

Business effect:

- faster decisions;
- less searching in different pages;
- better owner visibility.

## 4. Suggested Automation Modules

The platform should be designed around these automation modules:

- `document-intelligence`
- `attendance-automation`
- `schedule-automation`
- `payments-automation`
- `invoice-automation`
- `notification-engine`
- `compliance-monitoring`
- `reporting-engine`
- `risk-scoring`
- `business-assistant`
- `platform-feature-flags`

## 5. Automation Triggers

The most important triggers in the system should be:

- `student.created`
- `student.updated`
- `document.uploaded`
- `document.verified`
- `document.expiry.threshold_reached`
- `attendance.saved`
- `lesson.created`
- `lesson.completed`
- `lesson.canceled`
- `payment.created`
- `payment.updated`
- `payment.overdue`
- `invoice.created`
- `invoice.issued`
- `vehicle.restricted`
- `instructor.restricted`
- `daily.automation.scan`
- `weekly.owner.summary`

## 6. Human Approval Gates

Even in a highly automated platform, these areas should keep explicit approval when needed:

- invoice issue or correction if validation fails;
- OCR result save when confidence is low;
- schedule change affecting multiple lessons;
- automated restriction of vehicle or instructor on critical compliance issue;
- high-impact owner recommendations that trigger real financial or schedule actions.

## 7. Technical Implementation Model

The safest implementation model for this product is:

- `React + Vite` frontend;
- `Node.js + Express` modular monolith backend;
- `PostgreSQL` as system of record;
- `Redis` for locks, coordination, and caching;
- background jobs for automation execution;
- `GraphQL` for rich read views;
- `REST` for commands, uploads, and integrations;
- OCR/document automation via the existing local automation pipeline;
- audit logs for every important automated action.

Automation should not run as hidden logic inside random endpoints. It should run through explicit services and jobs, for example:

- `SaveAttendanceService`
- `GenerateInvoiceDraftService`
- `SendPaymentReminderJob`
- `EvaluateDropoutRiskJob`
- `ScanExpiringDocumentsJob`
- `BuildOwnerWeeklySummaryJob`

## 8. Recommended Rollout Order

The best rollout order is:

1. documents and OCR
2. attendance automation
3. payment reminders and overdue tracking
4. invoice draft generation
5. schedule suggestions and conflict handling
6. reporting automation
7. dropout risk scoring
8. business assistant

This order is best because it first automates the highest-friction administrative work, then moves into intelligence and optimization.

## 9. What "Maximum Automation" Should Mean Here

Maximum automation does not mean removing people from the process.

It means:

- people stop repeating the same low-value work;
- the platform pre-fills, warns, suggests, and executes safe steps;
- humans approve only the decisions that matter.

The real target state is:

- one place to operate the school;
- one source of truth;
- one platform that moves work forward automatically.
