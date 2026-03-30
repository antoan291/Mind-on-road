# Automation Research and Regulatory Notes

## 1. Purpose

This document revisits the automation strategy with two lenses:

- what is realistically automatable in a Bulgarian driving-school business;
- what should stay integration-ready, but not be promised as fully automatic before a verified institutional integration exists.

It complements [automation_strategy.md](/C:/AD/work/My%20company/school/docs/automation_strategy.md).

## 2. Executive Conclusion

The product should automate aggressively, but in layers:

- `fully automated inside the platform` for internal workflows;
- `semi-automated with human approval` for legal, financial, and OCR-sensitive actions;
- `integration-ready` for state-facing workflows involving IAAA/DAI, MVR/KAT, and NRA/NAP;
- `never assume direct state-system write access` unless an official supported API/process is confirmed.

The practical strategy is:

1. automate internal operations first;
2. capture evidence and audit logs for every important action;
3. prepare clean export/integration boundaries for institutions;
4. add institution-specific adapters only where the legal and technical path is real.

## 3. Official Bulgarian Research

### 3.1 IAAA / DAI: training documentation is now digitally reportable

The strongest official signal for this product comes from the Executive Agency "Automobile Administration".

According to the official agency news published on `12 February 2025`, training centers can maintain theory and practical training documentation both on paper and digitally. The same announcement says the agency developed a mobile application through which theory and practice training will be reported electronically, and that use of the app becomes mandatory after `12 July 2025`.  
Source: [IAAA news, 12 February 2025](https://rta.government.bg/bg/news/3993), [category view](https://rta.government.bg/bg/news/3993?cat=23)

There is also a follow-up official notice from `14 February 2025` stating that the mobile application is available in Google Play and Apple App Store.  
Source: [IAAA notice for training centers, 14 February 2025](https://rta.government.bg/bg/news/3999)

The agency also publishes training-hour references for theory and practical training periods, confirming that electronic reporting and reference visibility are part of the operational landscape.  
Source: [IAAA training references](https://rta.government.bg/bg/776)

### 3.1.1 Product implication

This means the platform should not position itself as a replacement for official reporting. It should position itself as:

- the operational system of record for the driving school;
- the preparation and validation layer before official reporting;
- the automation layer that reduces admin work around official compliance.

Therefore the product should support:

- internal attendance and lesson recording;
- instructor and vehicle assignment validation;
- completion checks before official reporting;
- export and reconciliation workflows;
- audit history for who saved what and when;
- optional deep-link or handoff workflow to the official reporting app/process.

### 3.2 MVR / KAT: e-services exist, but product claims must stay careful

The Ministry of Interior exposes electronic services, including the portal for electronic administrative services and services related to driving-license documents such as duplicate issuance and driver certificates.  
Sources: [MVR e-services](https://mvr.bg/opp/%D0%B5%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%BD%D0%BD%D0%B8-%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B8), [MVR electronic administrative services](https://www.mvr.bg/opp/%D0%B5%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%BD%D0%BD%D0%B8-%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B8/%D0%B5%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%BD%D0%BD%D0%B8-%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D0%B8-%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B8), [regional MVR e-services page](https://mvr.bg/stara-zagora/%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D0%B8-%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B8/%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D0%B8-%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B8-%D0%B7%D0%B0-%D0%B3%D1%80%D0%B0%D0%B6%D0%B4%D0%B0%D0%BD%D0%B8/%D0%B1%D1%8A%D0%BB%D0%B3%D0%B0%D1%80%D1%81%D0%BA%D0%B8-%D0%B4%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B8-%D0%B7%D0%B0-%D1%81%D0%B0%D0%BC%D0%BE%D0%BB%D0%B8%D1%87%D0%BD%D0%BE%D1%81%D1%82-%D0%BD%D0%BE%D0%B2/%D0%B5%D0%BB%D0%B5%D0%BA%D1%82%D1%80%D0%BE%D0%BD%D0%BD%D0%B8-%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D0%B8-%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B8-e-administrative-services)

### 3.2.1 Product implication

The platform should automate:

- exam-readiness checklists;
- document completeness checks;
- reminders for missing learner documents;
- reminders for expiring personal or instructor documents;
- preparation packages for the next state-facing step.

But the product should not claim:

- automatic submission to KAT/MVR;
- automatic legal status changes inside state systems;
- automatic issuance-related workflows unless a verified integration exists.

The correct product stance is:

- `prepare`;
- `validate`;
- `remind`;
- `export`;
- `track status`;
- `support the admin`.

### 3.3 NRA / NAP: integration-ready is justified, but scope must be controlled

The official NRA pages confirm that electronic services are available through the e-services portal and that different access modes exist, including PIK and qualified electronic signature.  
Source: [NRA access modes for e-services](https://nra.bg/wps/portal/nra/uslugi/vuzmojnosti-za-dostup-do-e-uslugite-na-nap)

There is also an official NRA publication about a new electronic service for direct business access to NRA systems via software key / API key, describing system-to-system connectivity and a phased rollout.  
Source: [NRA direct access service](https://nra.bg/wps/portal/nra/actualno/zaraboti-nova-e-usluga-za-firekten-dostup)

### 3.3.1 Product implication

This is important, but it does not justify promising full automated tax automation from day one.

The right architecture is:

- internal invoicing and payment ledgers inside the platform;
- high-quality finance records and exports;
- API/integration adapter boundary for future NRA-facing workflows;
- human approval before submission of financially or legally binding data.

The system should therefore support:

- invoice creation and correction workflows;
- payment reconciliation;
- financial exports;
- future connector/adapters for accounting or NRA-facing automation.

## 4. Worldwide Product Research

Multiple driving-school products around the world repeatedly emphasize the same value areas:

- smart scheduling;
- student self-service booking;
- automated reminders;
- instructor and vehicle management;
- payment collection;
- analytics and profitability visibility;
- retention / risk / progress insight.

Examples reviewed:

- [EliteDrive](https://elitedriveapp.com/)
- [Driveato](https://www.driveato.com/)
- [EchoDial driving school scheduling](https://echodial.io/driving-school-scheduling-software)
- [Teachworks driving school software](https://teachworks.com/driving-school-management-software)
- [Drive School Suite](https://www.driveschoolsuite.com/)
- [DriversEdPro features](https://driversedpro.com/features)
- [Reservio driving school software](https://www.reservio.com/driving-school-software)
- [Apptoto for driver education](https://www.apptoto.com/industries/driversed)

### 4.1 Repeated patterns

The repeated patterns across these products are:

- fewer no-shows through reminders;
- easier scheduling and fewer calendar conflicts;
- instructor and fleet visibility;
- student progress tracking;
- online payment convenience;
- admin time reduction;
- visibility into business performance.

### 4.2 What most products still do weakly

Most products appear stronger in:

- booking;
- reminders;
- calendaring;
- light CRM.

They are usually weaker in:

- strict compliance logging for the Bulgarian regulatory environment;
- document OCR with Bulgarian documents;
- AI-assisted document validation;
- tenant-aware automation governance for multi-school SaaS;
- combined operational + regulatory + financial automation from one system.

This is a major product opportunity.

## 5. Revised Automation Model

### 5.1 Category A: automate fully inside the platform

These should be fully automated:

- lesson reminders;
- payment reminders;
- student onboarding checklists;
- missing-document reminders;
- instructor and vehicle document expiry reminders;
- automatic dashboard/report refresh;
- student risk scoring;
- owner/admin weekly summaries;
- auto-generation of internal tasks and alerts.

### 5.2 Category B: automate with human approval

These should be semi-automated:

- OCR extraction from Bulgarian ID cards and licenses;
- invoice issue/correction flows;
- exception handling for suspicious payment/doc data;
- student readiness decisions;
- compliance decisions after conflicting data.

### 5.3 Category C: integration-ready, but not promised as fully automatic

These should be designed as adapter-based capabilities:

- NRA-facing automated exchange;
- MVR/KAT-facing workflows;
- IAAA/DAI official reporting handoff or integration;
- accounting software sync;
- banking reconciliation integrations.

## 6. Revised Product Recommendations

### 6.1 Highest-priority automations

The highest-value first wave is:

1. scheduling and reminders;
2. theory attendance and save-to-system flows;
3. practical lesson completion and follow-up flows;
4. OCR and document validation;
5. payment reminders and invoice operations;
6. instructor/vehicle compliance monitoring;
7. risk-of-dropout signals;
8. owner business assistant and financial summaries.

### 6.2 Compliance-first insight layer

A strong differentiator for this product is not only automation, but `compliance-aware automation`.

That means:

- the system knows what is missing;
- knows what expires;
- knows what cannot proceed;
- explains why;
- generates the next correct action.

This is better than generic “task automation”.

## 7. Product Design Consequences

The UI should explicitly separate:

- `Оперативно автоматизирано`
- `Изисква преглед`
- `Готово за официално подаване`
- `Изчаква външна институция`

The automation layer should also expose:

- trigger source;
- confidence;
- audit trail;
- last automated action;
- next recommended action.

## 8. Final Position

The right strategy for this software is:

- automate as much as possible inside the school’s own operational boundary;
- be excellent at preparation, validation, reminders, and reconciliation;
- treat official institution exchange as a controlled boundary, not as a casual claim;
- use AI where it reduces admin work, but keep approval where legal, financial, or OCR risk is material.

In short:

- `maximum automation` remains the correct product vision;
- but `maximum safe automation with regulated boundaries` is the correct implementation strategy.
