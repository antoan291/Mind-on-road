# Stitch Prompts for KursantAI / DriveAdmin

## Purpose of this file

This file contains ready-to-use prompts for Stitch to design the full KursantAI / DriveAdmin system. The prompts are written to reduce common Stitch problems:

- changing the visual style from screen to screen;
- inheriting random styling from a previously generated screen;
- breaking the project template across modules;
- making the interface too complicated;
- creating a desktop and mobile experience that feel like different products.

Important rule:

- All instructions to Stitch should be in English.
- All UI text shown inside the product should be in Bulgarian.

## How to use this file

- Start with the design system prompt.
- Then generate the main desktop shell and navigation.
- Then generate the module prompts one by one.
- Then generate the mobile prompts.
- At the end, run the consistency prompt.
- If Stitch starts drifting, use one of the correction prompts at the bottom of this file.

## Mandatory instruction block for every prompt

Add this block at the beginning or end of every Stitch prompt:

```text
Important:
Use the following design system as the single visual source of truth for the entire project: "The Obsidian Navigator".
Do not change the visual system between screens.
Do not invent a new template if one already exists.
Use the same colors, typography, spacing, radii, button sizes, tables, cards, filters, modals, and navigation patterns across the entire project.
If information is missing, preserve the established design language and make the most conservative and consistent decision.
Do not mix different styles.
The interface must feel premium, calm, modern, highly usable, and very easy for older women with low computer confidence.
Keep the experience elegant and high-end, but never confusing, noisy, or visually exhausting.
Use tonal layering instead of hard separation lines.
Use intentional asymmetry carefully, but never at the cost of clarity.
Keep all page headers left-aligned.
All UI copy inside the product must be in Bulgarian.
```

## 1. Master prompt for the design system

```text
Create a complete design system for a web-based driving school management platform called KursantAI / DriveAdmin.

The system will be used mainly by administrative staff, including older women who are not very confident with computers. The interface must be extremely clear, friendly, calm, professional, and easy to use.

Base the entire design system on this creative direction:

Design System Specification: The Obsidian Navigator

Creative North Star:
The product should feel like the intersection of high-performance automotive telemetry and highly efficient operational software. The experience should feel premium, technical, confident, modern, and editorial, but still warm and accessible enough for non-technical administrative users.

The visual system must avoid generic dashboard-template aesthetics. Use tonal layering and intentional asymmetry, but always preserve usability and clarity.

Color system:
- Page background: #060e20
- Secondary panel background: #091328
- Card level: #192540
- Popover / modal level: #1f2b49
- Primary accent: Indigo #6366F1
- Primary dim accent: #6063ee
- AI accent: Purple Violet #A78BFA
- Ghost border fallback: #40485d at low opacity only

Core visual rules:
- Apply the "No-Line Rule": do not use 1px section borders for main layout separation.
- Use background shifts and tonal stacking to define layout zones.
- Treat the interface as layered smoked glass surfaces.
- Floating elements such as modals, tooltips, and AI modules may use a subtle glassmorphism treatment with semi-transparent surfaces and 12px backdrop blur.
- Primary action buttons should use a subtle 135-degree gradient from #6366F1 to #6063ee.
- Avoid traditional web-style shadows. Use ambient depth and tonal contrast instead.

Typography:
- Use Inter as the only typeface.
- Use strong weight contrast and editorial scale contrast.
- Large headings may use 2rem size with tight tracking.
- Utility labels should be uppercase with tracking.
- Body text must preserve readability for Bulgarian Cyrillic and use generous line-height.

Depth and elevation:
- Prefer tonal layering over borders.
- Use ultra-diffused dark shadows for floating layers.
- Use ghost borders only when accessibility or high-density data requires it.
- Primary interactive hover states may use a soft indigo glow.

Component logic:
- Buttons must feel precise and premium.
- Inputs must be large, calm, and highly readable.
- Data-heavy screens must avoid divider-line noise.
- Tables must rely on spacing, tonal row grouping, and subtle contrast rather than harsh borders.
- Only use the AI Purple Violet accent sparingly, as a signature highlight.

Driving-school-specific UI direction:
- Use telemetry-style cards for student progress and operational status.
- Use refined data cards and mini visual summaries where helpful.
- Maps should be visually subdued so functional UI states remain dominant.

Create one unified visual system that will be used across the entire product for both desktop and mobile, without changing the template from module to module.

Requirements:
- desktop-first admin system, but with a well-designed mobile adaptation;
- excellent readability;
- large and clear buttons;
- generous whitespace;
- clear sectioning;
- strong contrast without aggressive colors;
- a status color system for success, warning, overdue, error, and informational states;
- highly readable tables;
- highly readable forms;
- easy navigation;
- low cognitive load;
- minimal visual noise;
- suitable for full-day operational use.

Create:
- color system;
- typography;
- spacing system;
- border radii;
- shadows;
- buttons;
- input fields;
- dropdowns;
- tabs;
- tables;
- cards;
- status badges;
- modals;
- date/time picker style;
- sidebar navigation;
- top bar;
- mobile navigation pattern if appropriate.

Show the design system as a real UI foundation for an admin platform, not as a generic moodboard.

All visible interface text in the product must be in Bulgarian.

Important:
Use "The Obsidian Navigator" design system as the core visual identity.
Do not change the visual system between screens.
Do not invent a new template if one already exists.
Use the same colors, typography, spacing, radii, button sizes, tables, cards, filters, modals, and navigation patterns across the entire project.
If information is missing, preserve the established design language and make the most conservative and consistent decision.
Do not mix different styles.
The interface must feel premium, calm, modern, highly usable, and very easy for older women with low computer confidence.
Keep the interface elegant and expressive, but controlled.
Use tonal layering, rich slate depth, and restrained neon-functional accents.
Do not overuse purple accent modules.
All UI copy inside the product must be in Bulgarian.
```

## 2. Master prompt for desktop system architecture

```text
Use the already established design system and create the main desktop architecture for the KursantAI / DriveAdmin admin platform.

I want one persistent layout template for the whole project. This template should repeat across most internal screens so users are never confused.

Create:
- a main desktop app shell;
- left sidebar navigation;
- top bar;
- page title area;
- breadcrumb or contextual location indicator if useful;
- filter area;
- main content area;
- right-side contextual panel only if truly necessary;
- standard pattern for tables;
- standard pattern for detail pages;
- standard pattern for create/edit forms;
- standard pattern for modals;
- standard pattern for messages and alerts.

Navigation should include:
- Dashboard
- Students
- Payments
- Invoices
- Practical Lessons
- Theory
- Schedule
- Instructors
- Vehicles
- Documents
- Road Sheets
- Notifications
- Reports
- Settings

The interface must be:
- highly consistent;
- non-intimidating for non-technical users;
- premium;
- comfortable for everyday administrative work.

Show several core page templates:
- dashboard / overview page;
- table management page;
- detail page;
- create/edit form page.

All visible interface text in the product must be in Bulgarian.

Important:
Use the already established "Obsidian Navigator" visual system.
Do not change the visual system between screens.
Do not invent a new template if one already exists.
Use the same colors, typography, spacing, radii, button sizes, tables, cards, filters, modals, and navigation patterns across the entire project.
If information is missing, preserve the established design language and make the most conservative and consistent decision.
Do not mix different styles.
The interface must feel premium, calm, modern, highly usable, and very easy for older women with low computer confidence.
Use tonal layout separation instead of strong borders between navigation, side panels, and content.
All UI copy inside the product must be in Bulgarian.
```

## 3. Master prompt for mobile adaptation

```text
Use the same design system and the same visual language from the desktop version of KursantAI / DriveAdmin and create the mobile version of the product.

The mobile experience must not feel like a different product. It must feel like the same system, carefully adapted for a phone.

Mobile priorities:
- quick access to schedule;
- student profile;
- attendance and lesson status marking;
- payment visibility;
- notifications;
- documents;
- notes;
- relevant parent and student communication flows.

Requirements:
- large tap targets;
- excellent typography;
- one primary goal per screen where possible;
- short forms;
- easy-to-tap controls;
- sticky actions when useful;
- clear statuses;
- no clutter.

Create:
- mobile navigation model;
- mobile dashboard;
- mobile list page;
- mobile detail page;
- mobile action sheet or bottom sheet pattern;
- mobile forms.

All visible interface text in the product must be in Bulgarian.

Important:
Use the already established "Obsidian Navigator" visual system.
Do not change the visual system between screens.
Do not invent a new template if one already exists.
Use the same colors, typography, spacing, radii, button sizes, tables, cards, filters, modals, and navigation patterns across the entire project.
If information is missing, preserve the established design language and make the most conservative and consistent decision.
Do not mix different styles.
The interface must feel premium, calm, modern, highly usable, and very easy for older women with low computer confidence.
Keep the mobile version visually rich but calm, and preserve the same tonal dark surfaces and indigo-led hierarchy.
All UI copy inside the product must be in Bulgarian.
```

## 4. Prompt for the dashboard

```text
Use the established KursantAI / DriveAdmin template and create a desktop admin dashboard.

The dashboard must be very clear and show the most important daily operational information without visual noise.

Show:
- today’s lessons;
- upcoming lessons;
- overdue payments;
- students with missing payments;
- expiring documents;
- students with missed theory sessions;
- automatic 10-hour milestone signals for category B;
- important alerts;
- quick actions.

Style:
- premium admin dashboard;
- calm cards;
- very clear hierarchy;
- no clutter;
- no excessive charts;
- clear status colors.

All visible interface text in the product must be in Bulgarian.

Important:
Keep the same layout template and design system used across the project.
Do not make the dashboard feel like a different product.
```

## 5. Prompt for the Students module

```text
Use the same template and create the Students module for desktop.

Needed:
- student list;
- filters;
- search;
- statuses;
- quick preview;
- detailed student profile.

The student profile must include clear sections for:
- basic information;
- training category;
- assigned instructor;
- parent contact;
- theory group;
- paid lessons;
- used lessons;
- remaining lessons;
- payments;
- invoices;
- practical lessons;
- theory;
- notes;
- documents;
- signature screenshot;
- notifications and signals.

I want the profile to be extremely easy to scan and use. Do not overload the screen. Organize information in clean sections or cards.

All visible interface text in the product must be in Bulgarian.

Important:
Use the same design language, spacing rules, table patterns, and detail patterns.
```

## 6. Prompt for the Payments Table

```text
Use the established template and create the desktop screen for the Payments Table in KursantAI / DriveAdmin.

This is one of the most important Version 1 screens. It must feel like the operational financial control center for a driving school administration team.

The page must help the admin answer these questions immediately:
- Who has paid?
- Who still owes money?
- Which payments are overdue?
- Which students are partially paid?
- Which payment belongs to which category and package?
- Which payments already have invoices?
- Which records were corrected and by whom?
- What requires action today?

Design the page for everyday use by administrative staff, including older women with low digital confidence. The page must feel calm, structured, premium, and highly legible. It should not feel like complicated accounting software.

Create the full page structure:

1. Page header area
- Page title in Bulgarian
- Short operational subtitle in Bulgarian
- Primary action button for adding a payment
- Secondary action for export
- Optional secondary action for opening overdue-only view

2. Summary strip at the top
Create a row of calm telemetry-style summary cards that immediately show:
- total due amount for current filter
- total paid amount for current filter
- remaining unpaid amount
- overdue payments count
- partially paid students count
- payments without invoice count

These cards must feel premium and very easy to scan. Use the Obsidian Navigator style with tonal layering and subtle indigo emphasis, not loud dashboard widgets.

3. Filter and control area
Create a strong but simple control bar with:
- search by student name
- filter by category
- filter by period
- filter by payment status
- filter by payment method
- filter by instructor if useful
- filter by theory group if useful
- filter for overdue only
- filter for payments without invoice
- clear filters action

This control area must be very easy to understand and should not look crowded. Use a clean left-to-right structure and preserve breathing room.

4. Main payments table
Create a large, highly readable table as the heart of the page.

The table must include these columns:
- payment number
- payment date
- student name
- category
- package or payment reason
- due amount
- paid amount
- remaining amount
- payment method
- payment status
- invoice status or invoice link
- last updated by
- last updated date
- quick actions

The rows must be easy to scan and not separated by harsh divider lines. Use tonal row grouping, spacing, subtle alternation, or soft hierarchy instead of aggressive borders.

Each row must visually communicate:
- fully paid
- partially paid
- overdue
- canceled
- corrected

Use calm status badges and strong data hierarchy. Currency must be displayed in Bulgarian format.

5. Row interaction behavior
Each row should support:
- opening student profile
- opening payment details
- opening linked invoice
- quick add correction
- mark as paid if allowed
- resend payment reminder if allowed

Do not overload the row with too many visible buttons. Use a clear primary row action and a compact secondary actions menu.

6. Payment detail drawer or modal
Create a right-side detail drawer or calm modal for one payment record.

It must show:
- student information
- category
- payment date
- due amount
- paid amount
- remaining amount
- payment status
- method of payment
- payment reason
- linked invoice
- package or lesson bundle if applicable
- notes
- history of changes
- who created the record
- who last edited it
- timestamps

Also show a small activity timeline for:
- created
- edited
- invoice linked
- reminder sent
- status changed

7. Admin comfort and usability rules
This page must be optimized for long daily use. Apply these usability rules:
- very clear left alignment
- large enough row height
- very readable numeric values
- obvious visual difference between amount due, amount paid, and amount remaining
- no clutter
- no tiny icons as primary information carriers
- no hidden critical information
- the most important financial status must be visible without opening details

8. Data-following capability
The administration must be able to follow all key data from this page without opening multiple screens.

The page must allow them to monitor:
- all money expected
- all money received
- all missing amounts
- overdue cases
- invoice coverage
- student-level payment state
- correction history

9. Visual tone
Keep the screen premium, dark, editorial, calm, and highly operational.
Use the Obsidian Navigator theme.
Use tonal depth and subtle indigo emphasis.
Do not make it flashy.
Do not make it bureaucratic.
Do not make it look like generic accounting software.

10. Output expectation
Generate a complete desktop payments page design with:
- page header
- top summary cards
- filter bar
- payments table
- one open detail drawer or modal example
- empty state if there are no payments
- clear overdue and partial payment states

All visible interface text in the product must be in Bulgarian.

Important:
Do not make the table heavy, intimidating, or overly accounting-oriented.
It must feel professional, clear, elegant, and pleasant for everyday administration work.
Keep the template consistent with the rest of the product.
```

## 6A. Prompt for the Invoices Page

```text
Use the established template and create the desktop screen for the Invoices page in KursantAI / DriveAdmin.

This page is a critical operational and document-control screen. It must help the administration create, monitor, find, verify, and follow invoices without stress. It is not just a list of documents. It is the main invoice workspace for daily administration.

The page must help the admin answer these questions immediately:
- Which invoices are issued today?
- Which students already have invoices?
- Which payments are still not invoiced?
- Which invoices are draft, issued, canceled, corrected, or overdue?
- Which invoices are linked to which student, category, and payment?
- Which invoices need attention right now?
- Which records were corrected and by whom?

Design this page for everyday use by administrative staff, including older women with low digital confidence. It must feel calm, clear, trustworthy, premium, and highly readable. It must not feel like complicated accounting software or a legal back-office screen.

Create the full page structure:

1. Page header area
- Page title in Bulgarian
- Short operational subtitle in Bulgarian
- Primary action button for creating a new invoice
- Secondary action for export
- Optional secondary action for "Invoices needing attention"

2. Summary strip at the top
Create a row of calm telemetry-style summary cards that immediately show:
- total invoices count for current filter
- invoices issued today
- invoices in draft state
- invoices linked to payment
- invoices without linked payment
- overdue invoices count if applicable
- corrected or canceled invoices count

These summary cards must feel premium and easy to scan. Use the Obsidian Navigator style with tonal layering, subtle indigo emphasis, and a restrained editorial look.

3. Filter and control area
Create a strong but simple control bar with:
- search by invoice number
- search by student name
- filter by category
- filter by period
- filter by invoice status
- filter by payment link status
- filter by creator if useful
- filter for drafts only
- filter for invoices without payment link
- filter for corrected or canceled invoices
- clear filters action

The filter area must be calm, breathable, and easy to understand. Do not make it visually dense.

4. Main invoices table
Create a large, highly readable table as the heart of the page.

The table must include these columns:
- invoice number
- invoice date
- student name
- category
- invoice reason or package
- total amount
- payment link status
- invoice status
- payment status if available
- created by
- last updated by
- last updated date
- quick actions

If needed, visually support one secondary line in the row for extra document context, but keep the main row clean and readable.

The rows must be easy to scan and must not rely on harsh divider lines. Use tonal grouping, spacing, and subtle background differences instead of aggressive borders.

Each row must visually communicate:
- draft invoice
- issued invoice
- linked to payment
- missing payment link
- corrected invoice
- canceled invoice
- overdue invoice if applicable

Use calm status badges and strong data hierarchy. Currency must be shown in Bulgarian format.

5. Row interaction behavior
Each row should support:
- open invoice details
- preview invoice document
- download or print invoice
- open linked student profile
- open linked payment
- create correction if allowed
- cancel invoice if allowed

Do not overload the row with too many visible controls. Use one obvious row action and a compact secondary actions menu.

6. Invoice detail drawer or modal
Create a right-side detail drawer or a calm modal for one invoice record.

It must show:
- invoice number
- invoice date
- student information
- category
- invoice reason
- total amount
- linked payment
- linked payment status
- invoice status
- correction status if applicable
- created by
- last edited by
- timestamps
- attached notes if needed
- quick preview area for the invoice document

Also show a small activity timeline for:
- draft created
- invoice issued
- payment linked
- document viewed or exported if useful
- correction created
- canceled or updated

7. Create / edit invoice workflow area
The page should visually imply a very easy invoice creation flow.

Design the create invoice experience so it feels safe and simple for the admin:
- select student
- auto-fill known student data
- select category or reason
- show amount
- link payment if available
- preview invoice before final issuing

Make it clear that the system helps the admin and reduces manual typing.

8. Admin comfort and usability rules
This page must be optimized for long daily use. Apply these usability rules:
- strong left alignment
- generous row height
- highly readable invoice numbers and amounts
- obvious difference between invoice status and payment status
- no clutter
- no tiny icons as the primary way to understand the page
- no hidden critical information
- the most important document status must be visible without opening details

9. Data-following capability
The administration must be able to follow all core invoice data from this page without opening too many screens.

The page must allow them to monitor:
- all invoices created
- all issued invoices
- all drafts
- all invoices with linked payments
- all invoices without linked payments
- all corrected or canceled documents
- all invoice actions that may require follow-up

10. Visual tone
Keep the screen premium, dark, editorial, calm, and operational.
Use the Obsidian Navigator theme.
Use tonal depth, rich slate surfaces, subtle indigo emphasis, and sparse violet only if an AI-related function truly appears.
Do not make the page flashy.
Do not make it bureaucratic.
Do not make it look like generic invoice software.

11. Output expectation
Generate a complete desktop invoices page design with:
- page header
- top summary cards
- filter bar
- invoices table
- one open detail drawer or modal example
- one invoice preview state
- empty state if there are no invoices
- clear draft, issued, corrected, and canceled states

All visible interface text in the product must be in Bulgarian.

Important:
Do not make the page look like complex accounting software.
It must feel professional, safe, elegant, clear, and comfortable for daily administrative work.
Keep the template fully consistent with the rest of the product.
```

## 7. Prompt for practical lessons

```text
Use the established template and create the desktop page for the Practical Lessons module in KursantAI / DriveAdmin.

This page already exists conceptually with this structure in Bulgarian:
- Начало
- Практика
- Практика
- Управление на практически часове

Design this as a fully realized, high-quality operational page, not an empty placeholder.

This page is one of the most important daily-use screens in the whole system. It must help the school administration and instructors manage practical driving lessons quickly, clearly, and with minimal mental effort.

The page must help the admin answer these questions immediately:
- What practical lessons are scheduled today?
- Which lessons are completed?
- Which lessons are delayed?
- Which students did not show up?
- Which lessons were canceled?
- Which completed lessons still need evaluation?
- Which lessons have missing payment?
- Which lessons will trigger a parent notification because payment is missing?
- Which lessons need follow-up or admin action?

Design this page for heavy everyday operational use by administrative staff, including older women with low digital confidence. The page must feel calm, structured, premium, highly readable, and efficient. It must not feel like a complex dispatch console.

Create the full desktop page structure:

1. Header and page identity
- Show breadcrumb/navigation context in Bulgarian
- Show page title: "Управление на практически часове"
- Show a short subtitle in Bulgarian explaining the page purpose
- Primary action button for adding a new practical lesson
- Secondary action for switching to calendar view if needed
- Optional quick action for "Needs attention" or "Проблемни часове"

2. Top summary strip
Create a row of calm telemetry-style summary cards that immediately show:
- lessons scheduled today
- completed lessons
- late lessons
- no-show lessons
- canceled lessons
- lessons without payment
- lessons waiting for evaluation

These summary cards must feel premium, calm, and highly legible. Use the Obsidian Navigator style with tonal layering and subtle indigo emphasis. Do not make them flashy.

3. Filter and control area
Create a strong but simple control bar with:
- search by student name
- search by instructor
- filter by date or date range
- filter by lesson status
- filter by attendance state
- filter by payment status
- filter by vehicle
- filter by category
- filter for "today only"
- filter for "missing payment"
- filter for "needs evaluation"
- clear filters action

This control area must be easy to scan and not visually dense. The admin should understand it immediately.

4. Main lessons table or list
Create a large, highly readable main list as the operational heart of the page.

The table or structured list must include these columns:
- lesson date
- start time
- end time
- student name
- instructor
- vehicle
- category
- lesson status
- attendance status
- payment status
- post-lesson rating status
- quick actions

If useful, allow a secondary row layer for compact extra details, but keep the main row extremely clean.

The rows must visually communicate:
- scheduled
- completed
- late
- no-show
- canceled
- payment missing
- evaluation missing
- parent notification triggered

Do not use harsh divider lines. Use tonal grouping, spacing, subtle row contrast, and soft hierarchy instead.

5. Practical lesson state model
The UI must clearly support these practical states:
- scheduled lesson
- completed lesson
- late student or late lesson
- no-show student
- canceled lesson
- post-lesson rating entered
- payment available
- payment missing

The state logic must be visually easy to understand even for non-technical users.

6. Row actions
Each row should support:
- open lesson details
- mark as completed
- mark as late
- mark as no-show
- mark as canceled
- add or edit post-lesson rating
- open student profile
- open payment details if linked
- send or view parent notification if payment is missing

Do not overload rows with too many visible controls. Use one clear primary action and a compact secondary actions menu.

7. Lesson detail drawer or modal
Create a right-side detail drawer or a calm modal for one selected practical lesson.

It must show:
- student information
- instructor
- vehicle
- category
- lesson date and time
- lesson status
- attendance status
- payment status
- parent notification status
- post-lesson rating
- notes
- created by
- updated by
- timestamps

Also show a small activity timeline for:
- lesson created
- lesson updated
- status changed
- attendance marked
- rating added
- payment checked
- parent notification triggered or sent

8. Rating and evaluation area
The page must support a very easy way to enter post-lesson evaluation.

Design a small, low-friction rating pattern that lets the instructor or admin quickly record:
- rating after the lesson
- short comment if needed
- whether follow-up is needed

This should feel much lighter than a full form.

9. Payment visibility logic
Payment visibility must be a major part of the design.

The page must make it obvious:
- which lessons are financially safe
- which lessons have missing payment
- which lessons are linked to a payment
- which lessons require parent follow-up because payment is missing

This information must be visible without opening multiple screens.

10. Admin comfort and usability rules
This page must be optimized for long daily use. Apply these rules:
- strong left alignment
- large enough row height
- very clear typography
- obvious visual distinction between lesson state and payment state
- no clutter
- no tiny icons as primary information carriers
- no hidden critical status
- important problems must be visible immediately
- actions must feel safe and reversible where possible

11. Data-following capability
The administration must be able to follow all critical practice operations from this page without jumping between too many pages.

The page must allow them to monitor:
- today’s practical workload
- lesson completion
- attendance problems
- no-show cases
- canceled cases
- missing payment cases
- evaluation completion
- follow-up or notification triggers

12. Visual tone
Keep the page premium, dark, editorial, calm, and operational.
Use the Obsidian Navigator theme.
Use tonal depth, rich slate surfaces, subtle indigo emphasis, and strong readability.
Do not make it flashy.
Do not make it bureaucratic.
Do not make it look like generic fleet scheduling software.

13. Output expectation
Generate a complete desktop practical lessons page design with:
- breadcrumb area
- page header
- top summary cards
- filter bar
- main practical lessons table or structured list
- one open detail drawer or modal example
- one lesson with missing payment state
- one lesson with no-show state
- one lesson with completed + rated state
- empty state if there are no lessons

All visible interface text in the product must be in Bulgarian.

Important:
This page must feel like a real production operations screen used all day by the school.
It must be elegant, calm, fast to understand, and easy to use.
Keep the same project template and the same visual system.
```

## 8. Prompt for theory and attendance

```text
Use the established template and create the desktop page for the Theory module in KursantAI / DriveAdmin.

This page must be designed as a real operational workspace for theory groups, lectures, attendance, absences, and follow-up actions. It must not feel like an empty educational page or a generic course management screen.

This is one of the core daily-use pages for the driving school administration. It must help the admin and instructors manage theory attendance clearly, quickly, and with minimal effort.

The page must help the admin answer these questions immediately:
- Which theory groups are active right now?
- Which lecture is happening today?
- Which students are present?
- Which students are absent?
- Which absences require automatic message sending?
- Which students must make up a missed lecture?
- Which theory groups are complete and which are behind?
- Which students cannot continue because they must recover missed theory attendance?

Design this page for administrative staff, including older women with low digital confidence. The page must feel calm, clear, premium, structured, and highly readable. It must not feel like a school LMS or a complicated training portal.

Create the full desktop page structure:

1. Header and page identity
- Show breadcrumb/navigation context in Bulgarian
- Show page title in Bulgarian
- Show a short subtitle in Bulgarian explaining that this page is for theory groups, lectures, attendance, and absences
- Primary action button for creating a new theory group or adding a lecture
- Secondary action for "Today’s lectures"
- Optional action for "Students needing recovery"

2. Top summary strip
Create a row of calm telemetry-style summary cards that immediately show:
- active theory groups
- lectures scheduled today
- students marked present today
- students absent today
- absences that triggered automatic message
- students who must recover missed theory
- groups nearing completion

These cards must feel premium, calm, and easy to scan. Use the Obsidian Navigator design language with tonal layering and subtle indigo emphasis.

3. Filter and control area
Create a strong but simple control bar with:
- search by student name
- search by group name
- filter by theory group
- filter by lecture date
- filter by attendance state
- filter by absence state
- filter for "today only"
- filter for "absent only"
- filter for "needs recovery"
- filter for "message sent"
- clear filters action

This control area must be spacious and easy to understand. Avoid visual density.

4. Primary page layout
Create a professional two-level theory workspace:

Level A: theory groups overview
- a structured list or table of theory groups
- each group must clearly show group name, based on the DAI naming system
- start date
- current lecture count
- student count
- attendance progress
- completion progress
- quick open action

Level B: detailed group view
- a selected group opens a detailed theory attendance workspace
- show group information
- upcoming lectures
- completed lectures
- attendance per lecture
- absent students
- recovery-required status

Do not make the layout feel fragmented. It must still follow the same overall product template.

5. Theory groups list
The groups overview must clearly show:
- group name from DAI system
- category
- number of students
- number of completed lectures
- number of remaining lectures
- attendance status summary
- students with absences
- quick open action

Each row or card must be easy to scan. Use tonal hierarchy instead of harsh borders.

6. Detailed group page or panel
When one theory group is opened, show:
- group name
- category
- date range
- total students
- total lectures
- completed lectures
- next scheduled lecture
- attendance completion indicator

Also show a lecture list where each lecture row includes:
- lecture date
- lecture topic or title if available
- instructor
- attendance status
- absent count
- quick action to mark attendance
- quick action to open attendance details

7. Theory group attendance page behavior
When the admin or instructor clicks a theory group, they must enter a dedicated theory group page.

This theory group page must feel like the real daily workspace for that group.

The page must include:
- a clear group header with the group name in Bulgarian;
- group metadata such as category, total students, completed lessons, remaining lessons, and next lecture;
- a structured lesson-by-lesson attendance workspace;
- a full student list for the selected group.

The most important requirement:
for each lesson, the page must show the full list of students in the group, and for each student there must be very clear attendance actions:
- green button for "here" / present;
- red button for "not here" / absent;
- button for automatic Viber message.

These attendance buttons must be large, obvious, calm, and impossible to misunderstand. The green and red meaning must be instantly clear even for non-technical users.

8. Attendance marking experience
Attendance marking must be extremely easy and require very few actions.

Create a clean lesson attendance interface where the instructor or admin can:
- select one lesson;
- see every student in that group;
- mark one student as present with a green button;
- mark one student as absent with a red button;
- trigger an automatic Viber message for the absent student;
- quickly mark the whole group if useful;
- adjust one student manually;
- confirm attendance.

The attendance UI must feel faster than using paper and visually much clearer than a spreadsheet.

For each student row in the lesson attendance area, show:
- student name;
- attendance state;
- green present button;
- red absent button;
- automatic Viber button;
- status if a message was already sent;
- recovery-needed indicator if applicable.

9. Automatic Viber message behavior
When a student is marked absent, the UI must support an automatic Viber message action.

The automatic Viber message action should feel like a clear operational button, not a hidden menu action.

The message preview or detail state should communicate that the automatic message contains:
- the date of the missed theory lesson;
- information that the student must recover the lesson in order to continue;
- the text that the individual theory lesson costs 25 EUR;
- a clear next-step instruction in Bulgarian.

Design a calm preview or side detail area where the admin can understand what the message will say before or after sending.

10. Absence logic and follow-up
The UI must clearly support these theory absence scenarios:
- absent student
- automatic message sent
- due amount shown if applicable
- recovery required
- cannot continue until recovery

When a student is absent, the system should visually show:
- missed date
- absence status
- message status
- due amount if relevant
- recovery requirement

This information must be visible without making the page feel punitive or harsh.

11. Student-level visibility
Within the theory page, the administration must still be able to follow student-level operational status.

For absent students, make it easy to understand:
- who is absent
- from which group
- on which date
- whether a message was sent
- whether recovery is required
- whether there is a financial consequence

12. Detail drawer or modal
Create a calm right-side detail drawer or modal for one selected absent student or one selected lecture.

It should show:
- student name
- theory group
- lecture date
- attendance status
- message sent status
- due amount if relevant
- recovery requirement
- related notes
- created or updated timestamps

Also show a small activity timeline for:
- attendance marked
- absence recorded
- message sent
- recovery flagged
- follow-up completed

13. Admin comfort and usability rules
This page must be optimized for long daily use. Apply these rules:
- strong left alignment
- generous row height
- very clear typography
- very obvious difference between group-level information and lecture-level information
- very obvious difference between present, absent, and message actions
- no clutter
- no tiny icons as primary information carriers
- important absences must be visible immediately
- attendance actions must feel safe and simple

14. Data-following capability
The administration must be able to follow all critical theory operations from this page without opening too many additional screens.

The page must allow them to monitor:
- active groups
- lecture progress
- attendance completion
- absences
- automatic messages
- recovery-required students
- theory completion readiness

15. Visual tone
Keep the page premium, dark, editorial, calm, and operational.
Use the Obsidian Navigator theme.
Use tonal depth, rich slate surfaces, subtle indigo emphasis, and high readability.
Do not make it flashy.
Do not make it bureaucratic.
Do not make it look like a generic school admin portal.

16. Output expectation
Generate a complete desktop theory page design with:
- breadcrumb area
- page header
- top summary cards
- filter bar
- theory groups overview
- one opened group detail state
- one full theory group page state
- one attendance-taking state with full student list for a selected lesson
- visible green and red attendance buttons
- visible automatic Viber button
- one absent student detail drawer or modal
- one "needs recovery" state
- empty state if there are no groups or lectures

All visible interface text in the product must be in Bulgarian.

Important:
This page must feel like a real production admin screen for a driving school.
It must be elegant, calm, clear, and very easy to use.
Keep the same project template and the same visual system.
```

## 9. Prompt for notes and admin control

```text
Use the same template and create UI for student notes and administrative control.

Needed:
- instructor can add a note;
- admin can add a comment;
- admin comment must have a clearly required reason field;
- chronological note and comment history;
- author, date, and time;
- clear visual distinction between instructor notes and admin comments.

I want this to look professional, calm, and structured, not like a chat application.

All visible interface text in the product must be in Bulgarian.

Important:
Use the same visual language and the same component model.
```

## 10. Prompt for documents

```text
Use the established project template and create the Documents module.

Show:
- student documents;
- instructor documents;
- vehicle documents;
- school documents;
- validity status;
- expiry warnings;
- file upload;
- signature screenshot upload in the student profile.

I want documents to feel clear, trustworthy, and easy to scan.

Create:
- list / table view;
- detail view;
- upload modal;
- expiry status indicators.

All visible interface text in the product must be in Bulgarian.

Important:
It should feel reliable and structured, not legally heavy or visually bureaucratic.
```

## 10A. Prompt for instructors

```text
Use the established template and create the desktop page for the Instructors module in KursantAI / DriveAdmin.

This page must be a real operational workspace for the school administration. It must help the client and the admin understand every instructor clearly, manage their status, follow their workload, and see whether they are ready to work.

This page must not feel like an HR system. It must feel like a driving-school operations page.

The page must help the admin answer these questions immediately:
- Which instructors are active right now?
- Which instructors are available today?
- Which instructors are overloaded?
- Which instructors have expiring or missing documents?
- Which instructors have lessons scheduled today?
- Which instructors are currently unavailable because of rest, leave, or blocked time?
- Which instructors need attention from the administration?

Design this page for daily use by administrative staff, including older women with low digital confidence. It must feel calm, premium, structured, and very easy to scan.

Create the full desktop page structure:

1. Header and page identity
- breadcrumb in Bulgarian
- page title in Bulgarian
- short operational subtitle in Bulgarian
- primary action button for adding a new instructor
- secondary action for export
- optional secondary action for "Needs attention"

2. Top summary strip
Create calm telemetry-style summary cards showing:
- total instructors
- active instructors
- available today
- instructors with lessons today
- instructors with expiring documents
- unavailable instructors

These cards must feel premium, calm, and easy to scan. Use the Obsidian Navigator visual language with tonal layering and subtle indigo emphasis.

3. Filter and control area
Create a strong but simple control bar with:
- search by instructor name
- filter by status
- filter by availability
- filter by category taught
- filter by documents status
- filter for "has lessons today"
- filter for "needs attention"
- clear filters action

This control area must be spacious and easy to understand.

4. Main instructors table or structured list
Create a large, highly readable table or structured list as the main operational view.

It must include these columns:
- instructor name
- categories
- phone
- status
- today’s availability
- lessons today count
- assigned vehicle if relevant
- document status
- next important date
- quick actions

Each row must make it easy to understand:
- who the instructor is
- whether they are active
- whether they can work
- whether they have scheduled activity
- whether there is an administrative issue

Use tonal grouping, spacing, and calm hierarchy instead of harsh divider lines.

5. Instructor statuses
The page must clearly support statuses such as:
- active
- unavailable
- on break
- on leave
- blocked due to document issue

These states must be visually obvious but still elegant and calm.

6. Document and compliance visibility
This page must help the administration follow instructor readiness to work.

For each instructor, show clear visibility for:
- valid documents
- expiring documents
- expired documents
- missing documents

The admin must immediately understand whether the instructor can be scheduled.

7. Availability and workload visibility
The page must clearly show:
- if the instructor has lessons today
- if the instructor is free or occupied
- if the instructor has a rest block
- if the instructor appears overloaded or fully booked

This should feel operational and useful, not analytical for its own sake.

8. Quick actions
Each instructor row should support:
- open instructor profile
- edit instructor
- view schedule
- mark unavailable
- add rest / blocked time
- open documents

Do not overload the row with too many visible buttons. Use one clear primary action and a compact secondary actions menu.

9. Instructor detail drawer or profile preview
Create a calm right-side detail drawer or profile preview for one selected instructor.

It must show:
- instructor name
- categories taught
- phone
- email if used
- status
- availability today
- lessons today
- document status
- assigned vehicle if relevant
- notes
- created by
- updated by
- timestamps

Also show a small activity timeline for:
- instructor created
- status changed
- availability updated
- document warning triggered
- schedule updated

10. Instructor profile direction
This page should visually suggest that clicking an instructor opens a deeper profile page.

That future instructor profile should contain:
- personal information
- categories
- contact information
- schedule
- rest / blocked time
- assigned students if needed
- documents
- notes

11. Admin comfort and usability rules
This page must be optimized for long daily use. Apply these rules:
- strong left alignment
- generous row height
- very clear names and statuses
- obvious difference between active, unavailable, and document-blocked states
- no clutter
- no tiny icons as primary information carriers
- important issues must be visible immediately

12. Data-following capability
The administration must be able to follow all major instructor data from this page:
- who is available
- who is active
- who has lessons today
- who has document problems
- who needs admin action

13. Visual tone
Keep the page premium, dark, editorial, calm, and highly operational.
Use the Obsidian Navigator theme.
Use tonal depth, rich slate surfaces, subtle indigo emphasis, and high readability.
Do not make it flashy.
Do not make it bureaucratic.
Do not make it look like generic employee management software.

14. Output expectation
Generate a complete desktop instructors page design with:
- breadcrumb area
- page header
- top summary cards
- filter bar
- main instructors table or structured list
- one instructor detail drawer or preview state
- one instructor with expiring documents
- one unavailable instructor state
- one active instructor with lessons today
- empty state if useful

All visible interface text in the product must be in Bulgarian.

Important:
This page must feel like a real production admin page for a driving school SaaS product.
It must be elegant, calm, highly readable, and easy for the client to use.
Keep the same project template and the same visual system.
```

## 11. Prompt for schedule

```text
Use the established template and create the desktop Schedule page for KursantAI / DriveAdmin.

This page must be one of the most important operational screens in the system. It is the real planning center for the driving school and must allow the administration to understand the entire day quickly and make changes with confidence.

The schedule currently needs much more detail. It must clearly show which lesson belongs to which instructor, must allow easy instructor selection, and must support adding a rest block. The schedule must run from 08:00 to 24:00.

The page must help the admin answer these questions immediately:
- Which instructor has which lesson?
- At what exact time is each lesson?
- Which vehicle is used?
- Which student is booked?
- Where are there free slots?
- Where are there conflicts?
- Where has a rest block been added?
- Which lessons are completed, upcoming, delayed, canceled, or problematic?

Design this page for administrative staff, including older women with low digital confidence. It must feel calm, clear, premium, and easy to understand, even when there are many lessons in one day.

Create the full desktop page structure:

1. Header and page identity
- breadcrumb in Bulgarian
- page title in Bulgarian
- short operational subtitle in Bulgarian
- primary action button for adding a lesson
- secondary action button for adding a rest block
- secondary action for switching view if needed

2. Top summary strip
Create calm telemetry-style summary cards for:
- total lessons today
- active instructors today
- free slots today
- conflicts or overlaps
- rest blocks today
- lessons without payment if relevant

These cards must feel premium, clear, and easy to scan. Use the Obsidian Navigator visual language with tonal layering and subtle indigo emphasis.

3. Control and filter area
Create a strong but simple control bar with:
- date selector
- previous day / next day actions
- search by student name
- filter by instructor
- filter by vehicle
- filter by category
- filter by lesson status
- filter for free slots
- filter for conflicts
- clear filters action

The instructor filter is very important.

For instructor selection, choose the UI pattern that is best for clarity and speed:
- either segmented instructor buttons when the number of instructors is small,
- or a select menu / dropdown when there are many instructors.

Pick the better option based on usability for this type of page. If the school has only a few instructors visible at once, use clearly styled buttons because they are faster and easier for non-technical users. If there are many instructors, use a calm select menu with very clear labels.

4. Main schedule area
Create a full schedule workspace from 08:00 to 24:00.

This time range is mandatory.

The schedule must clearly display:
- time on the vertical axis from 08:00 to 24:00;
- instructors as a primary organizing dimension;
- lesson blocks positioned by time;
- clear visibility of which lesson belongs to which instructor.

The most important requirement:
the admin must immediately see which instructor owns each lesson without needing to click into the lesson.

Design the schedule so that instructor ownership is obvious through:
- instructor columns, or
- instructor lanes, or
- a selected-instructor focused daily view,

depending on which solution gives the clearest and calmest operational result.

5. Lesson cards inside the schedule
Each lesson block must clearly show:
- student name
- instructor name
- vehicle
- start time
- end time
- category
- lesson status

If space is limited, prioritize:
- student name
- instructor name
- time
- vehicle

The lesson card must make it obvious which block belongs to which instructor.

Lesson blocks must visually differentiate:
- scheduled
- confirmed
- completed
- late
- canceled
- no-show if relevant
- missing payment if relevant

Use calm but clear status styling. Avoid visual chaos.

Missing payment must be especially clear:
- when a lesson has "Липсва плащане", the lesson box itself must visibly use a red warning state;
- this red state must still feel premium and readable, not aggressive or cheap;
- the admin must immediately understand that this lesson has a financial problem.

Late lesson state must also be explicit:
- if the lesson is "закъснял", show it as visible text in red inside the lesson card;
- do not hide this only in an icon or badge;
- the red text must be readable immediately.

Text containment is very important:
- no text should overflow outside the lesson box;
- long student names, long vehicle labels, or status text must wrap, truncate, or scale safely inside the card;
- every lesson block must stay visually clean even in compact time slots;
- never let text break the layout or escape the card boundaries.

6. Rest block support
The schedule must allow adding a rest block.

This is a required feature.

The rest block must:
- be addable with a dedicated action;
- appear visually different from a lesson;
- belong to a specific instructor;
- occupy a real time slot in the schedule;
- block that instructor from being booked during that period.

Design the rest block as a calm operational element, not as an error state.

The administration must be able to understand instantly that this time is unavailable because of rest.

7. Quick creation and editing
The page should visually support fast daily operations.

Create a quick action pattern for:
- add lesson
- add rest block
- move lesson
- edit lesson
- cancel lesson

This should feel like professional schedule management, but not like a complex dispatch system.

Dialog behavior is required:
- when the user clicks "Нов час", open a dialog / modal for creating a new lesson;
- when the user clicks "Почивка", open a dialog / modal for creating a rest block.

The "Нов час" dialog must feel safe, structured, and easy for non-technical users.
It should include:
- student
- instructor
- vehicle
- category
- date
- start time
- end time
- notes if needed
- save and cancel actions

The "Почивка" dialog must also feel simple and very clear.
It should include:
- instructor
- date
- start time
- end time
- optional reason
- save and cancel actions

Both dialogs must use the same visual system as the rest of the project and must feel calm, premium, and operational.

8. Conflict visibility
Conflict detection must be very easy to understand.

The page must clearly reveal:
- double-booked instructor
- double-booked vehicle
- overlapping student booking
- blocked time because of rest

Conflicts must be visible but not aggressive. Use calm warning styling and obvious placement.

9. Schedule views
Choose the best structure for daily clarity.

The schedule should support at least a strong daily view. If you include other views, keep them secondary.

The best design direction is likely:
- primary daily view;
- optional instructor-focused view;
- optional vehicle-focused view.

Do not overcomplicate the interface with too many tabs if they reduce clarity.

10. Lesson detail drawer or modal
Create a calm right-side detail drawer or modal for one selected lesson.

It must show:
- student
- instructor
- vehicle
- category
- date
- start and end time
- payment status
- lesson status
- notes
- quick edit actions
- created by
- updated by
- timestamps

If the selected block is a rest block, the drawer should show:
- instructor
- date
- rest start time
- rest end time
- reason if available
- status as unavailable time

11. Admin comfort and usability rules
This page must be optimized for long daily use. Apply these rules:
- strong left alignment
- very clear time scale
- generous spacing
- clear lesson blocks
- obvious instructor visibility
- no clutter
- no tiny unreadable calendar chips
- no hidden critical scheduling information
- schedule must remain readable even with many items

12. Data-following capability
The administration must be able to follow all major scheduling information from this page:
- who is teaching
- when they are teaching
- which student they teach
- which vehicle is assigned
- where free time exists
- where rest is scheduled
- where conflicts exist

13. Visual tone
Keep the page premium, dark, editorial, calm, and highly operational.
Use the Obsidian Navigator theme.
Use tonal depth, rich slate surfaces, subtle indigo emphasis, and high readability.
Do not make it flashy.
Do not make it bureaucratic.
Do not make it look like a generic plugin calendar.

14. Output expectation
Generate a complete desktop schedule page design with:
- breadcrumb area
- page header
- top summary cards
- filter and instructor selection controls
- full day schedule from 08:00 to 24:00
- clearly visible instructor ownership for every lesson
- one visible rest block
- one visible conflict state
- one lesson detail drawer or modal
- empty or low-activity state if useful

All visible interface text in the product must be in Bulgarian.

Important:
This page must feel like a real production scheduling tool used all day by the school administration.
It must be elegant, calm, easy to read, and easy to operate.
Keep the same project template and the same visual system.
```

## 12. Prompt for mobile versions of key screens

```text
Use the same visual system and create mobile versions of these key screens:
- dashboard;
- student profile;
- practical lessons;
- theory and attendance;
- notifications;
- documents.

Priority:
- speed;
- readability;
- easy tapping;
- fewer actions;
- clear statuses;
- no clutter.

The mobile experience must be ideal for quick operational work while still feeling like the same product.

All visible interface text in the product must be in Bulgarian.

Important:
Do not invent a different mobile aesthetic. Adapt the same system.
```

## 13. Prompt for final consistency pass

```text
Review all screens created so far for KursantAI / DriveAdmin and unify them into one fully consistent design system.

Check and correct:
- sidebar;
- top bar;
- page headers;
- cards;
- tables;
- forms;
- modals;
- filters;
- spacing;
- typography;
- button hierarchy;
- badge styles;
- status colors;
- empty states;
- mobile adaptation.

Goal:
the entire system should look like one product designed by one team with one template, not like separate disconnected screens.

All visible interface text in the product must be in Bulgarian.

Important:
Do not invent a new style.
Only unify what already exists into one coherent system.
```

## 14. Short correction prompt if Stitch starts breaking the style

```text
Stop changing the design.
Preserve the already established visual system of the project.
Do not create a new template.
Do not change the colors, typography, spacing, navigation, tables, or components.
Continue only by extending the same design language onto the new screen.
All UI text inside the product must remain in Bulgarian.
```

## 15. Short correction prompt if Stitch makes the interface too complex

```text
Simplify the interface.
The users are administrative staff, including older women with low digital confidence.
Reduce visual noise, reduce the number of simultaneous actions, increase readability, make the hierarchy clearer, and keep only the most important things on screen.
Preserve the premium and modern feel, but make the UI calmer and easier.
All UI text inside the product must remain in Bulgarian.
```

## 16. Short correction prompt if Stitch creates a different mobile product

```text
The mobile version must feel like the same product, not a separate app.
Preserve the same color system, typography, components, logic, and visual language.
Adapt the layout for phone screens, but do not change the product identity.
All UI text inside the product must remain in Bulgarian.
```
