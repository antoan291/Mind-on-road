# MindOnRoad / DriveAdmin - Архитектурна Документация

## Obsidian Navigator Design System

Премиум, тъмна дизайн система за административен софтуер, оптимизирана за ежедневна употреба от неопитни потребители.

---

## Основна Архитектура

### Persistent Layout Template

Приложението използва един постоянен layout шаблон за целия проект:

```
┌─────────────────────────────────────────────────┐
│  Left Sidebar  │  Top Bar                       │
│                ├────────────────────────────────┤
│  Navigation    │  Page Header (Title + Actions) │
│                ├────────────────────────────────┤
│                │  Filter Bar (if needed)        │
│                ├────────────────────────────────┤
│                │  Main Content Area             │
│                │                                │
│                │                                │
└─────────────────────────────────────────────────┘
```

### Визуална Система

**Цветова Палета:**

- Page Background: `#060e20`
- Panel Background: `#091328`
- Card Level: `#192540`
- Modal Level: `#1f2b49`
- Primary Accent: `#6366F1` (Indigo gradient)
- AI Accent: `#A78BFA` (Purple Violet)

**Статусни Цветове:**

- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`
- Overdue: `#dc2626`
- Info: `#3b82f6`
- Neutral: `#64748b`

**Типография:**

- Font Family: Inter
- Headings: Semibold, tight letter-spacing
- Body: Regular, generous line-height (1.6)
- Utility Labels: Uppercase, 0.08em tracking

**Spacing:**

- XS: 8px
- SM: 12px
- MD: 16px
- LG: 24px
- XL: 32px
- 2XL: 48px

**Border Radius:**

- SM: 6px
- MD: 8px
- LG: 12px
- XL: 16px

---

## Component Patterns

### 1. Dashboard / Overview Page

**Характеристики:**

- Telemetry-style metric cards
- Today's schedule
- Recent activity feed
- AI insights (purple accent module)

**Компоненти:**

- `PageHeader` - Title + CTA buttons
- Metric cards grid (4 columns)
- Schedule list
- Activity timeline

---

### 2. Table Management Page

**Характеристики:**

- List/table view of entities
- Search and filters
- Bulk actions
- Row-level actions

**Компоненти:**

- `PageHeader` - Title + breadcrumbs + actions
- `FilterBar` - Search + filters + actions
- `DataTable` - Clean table with tonal row grouping
- Status badges

**Пример:** `/students`

---

### 3. Detail Page

**Характеристики:**

- Entity overview
- Key metrics and progress
- Related data tables
- Contextual actions

**Компоненти:**

- `PageHeader` - Entity name + edit button
- Info cards grid
- Progress indicators
- Related data section

**Пример:** `/students/:id`

---

### 4. Create/Edit Form Page

**Характеристики:**

- Sectioned forms
- Large, clear inputs
- Helpful validation messages
- Clear submit/cancel actions

**Компоненти:**

- `PageHeader` - Form title + breadcrumbs
- Card sections (grouped fields)
- `InputField`, `SelectField`, `TextareaField`
- Form actions at bottom

**Пример:** `/students/new`, `/students/:id/edit`

---

## UI Components

### PageHeader

```tsx
<PageHeader
  title="Заглавие"
  description="Описание"
  breadcrumbs={[{ label: "Начало" }, { label: "Страница" }]}
  actions={<Button>Действие</Button>}
/>
```

### FilterBar

```tsx
<FilterBar
  searchPlaceholder="Търсене..."
  searchValue={search}
  onSearchChange={setSearch}
  showFilterButton={true}
  activeFiltersCount={2}
/>
```

### DataTable

```tsx
<DataTable
  columns={columns}
  data={data}
  onRowClick={(row) => navigate(\`/entity/\${row.id}\`)}
/>
```

### Button

```tsx
<Button variant="primary" icon={<Plus />}>
  Действие
</Button>

// Variants: primary, secondary, ghost, destructive
// Sizes: small, medium, large
```

### StatusBadge

```tsx
<StatusBadge status="success">Активен</StatusBadge>

// Status: success, warning, error, overdue, info, neutral
```

### Form Fields

```tsx
<InputField
  label="Име"
  placeholder="Въведете име..."
  value={value}
  onChange={setValue}
  icon={<User />}
  required
  error="Грешка"
  helpText="Помощен текст"
/>

<SelectField
  label="Категория"
  options={[{ value: 'b', label: 'Категория B' }]}
  required
/>

<TextareaField
  label="Бележки"
  rows={4}
/>
```

### Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Заглавие"
  size="medium"
>
  {/* Content */}
</Modal>

// Sizes: small, medium, large
```

### Alert

```tsx
<Alert type="success" title="Заглавие" message="Съобщение" onClose={() => {}} />

// Types: success, warning, error, info
```

---

## Navigation Structure

1. **Табло** (Dashboard) - `/`
2. **Курсисти** (Students) - `/students`
3. **Плащания** (Payments) - `/payments`
4. **Фактури** (Invoices) - `/invoices`
5. **Практика** (Practical Lessons) - `/practical-lessons`
6. **Теория** (Theory) - `/theory`
7. **График** (Schedule) - `/schedule`
8. **Инструктори** (Instructors) - `/instructors`
9. **Автомобили** (Vehicles) - `/vehicles`
10. **Документи** (Documents) - `/documents`
11. **Пътни листове** (Road Sheets) - `/road-sheets`
12. **Известия** (Notifications) - `/notifications`
13. **Отчети** (Reports) - `/reports`
14. **Настройки** (Settings) - `/settings`

---

## Design Principles

1. **No-Line Rule** - Use tonal layering instead of borders
2. **Generous Whitespace** - Low cognitive load
3. **Large Interactive Elements** - Easy for non-technical users
4. **Consistent Patterns** - Same layout across all pages
5. **Calm, Premium Feel** - Suitable for all-day use
6. **Clear Hierarchy** - Strong weight and scale contrast
7. **Accessible Status** - Color + icon + text
8. **Bulgarian Language** - All UI text

---

## File Structure

```
/src/app/
├── App.tsx                          # Router provider
├── routes.tsx                       # Route configuration
├── components/
│   ├── layouts/
│   │   └── AppLayout.tsx           # Persistent layout
│   └── ui-system/
│       ├── PageHeader.tsx          # Page header component
│       ├── FilterBar.tsx           # Search & filters
│       ├── DataTable.tsx           # Table component
│       ├── Button.tsx              # Button component
│       ├── StatusBadge.tsx         # Status indicators
│       ├── FormField.tsx           # Form inputs
│       ├── Modal.tsx               # Modal dialogs
│       └── Alert.tsx               # Alert messages
└── pages/
    ├── DashboardPage.tsx           # Dashboard
    ├── StudentsPage.tsx            # Table page
    ├── StudentDetailPage.tsx       # Detail page
    ├── StudentFormPage.tsx         # Form page
    └── OtherPages.tsx              # Other pages
```

---

## Color Usage Guidelines

**Page Background** (`#060e20`):

- Main app background
- Never changes

**Panel Background** (`#091328`):

- Sidebar
- Top bar
- Filter bar
- Table headers

**Card Background** (`#192540`):

- Content cards
- Form sections
- Table rows (hover state)

**Modal Background** (`#1f2b49`):

- Modal dialogs
- Popovers
- Dropdowns

**Primary Accent** (Indigo):

- Primary buttons (with gradient)
- Active navigation items
- Progress bars
- Links and interactive elements
- Focus states (glow effect)

**AI Accent** (Purple):

- AI-powered features ONLY
- Use sparingly as signature highlight
- AI insights cards

**Ghost Borders**:

- Use at low opacity (0.15-0.4)
- Only when tonal separation isn't enough
- High-density data tables

---

## Accessibility Notes

- All interactive elements have clear hover states
- Status is conveyed through color + icon + text
- Large touch targets (minimum 44px)
- Clear focus indicators
- Generous spacing for easy scanning
- High contrast text
- Readable font sizes

---

## Mobile Adaptation

- Collapsible sidebar
- Responsive grid layouts
- Stack form fields on mobile
- Horizontal scroll for tables
- Mobile-optimized navigation overlay
