# KursantAI / DriveAdmin - Unified Design System

## "The Obsidian Navigator" Creative Direction

### Color Palette
```css
/* Backgrounds */
--bg-page: #060e20;          /* Main page background */
--bg-panel: #0a1628;         /* Panel background (sidebars, modals) */
--bg-card: #0f1d35;          /* Card background */

/* Text */
--text-primary: #e2e8f0;     /* Primary text */
--text-secondary: #94a3b8;   /* Secondary text */
--text-tertiary: #64748b;    /* Tertiary text, labels */

/* Accents */
--primary-accent: #6366F1;   /* Indigo - primary actions */
--ai-accent: #A78BFA;        /* Purple - AI features */

/* Status Colors */
--status-success: #22C55E;   /* Green */
--status-warning: #FBB036;   /* Amber */
--status-error: #EF4444;     /* Red */
--status-info: #3B82F6;      /* Blue */

/* Borders */
--ghost-border: rgba(148, 163, 184, 0.08);  /* Subtle borders */
```

### Typography
- **Font Family**: Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- **Line Height**: 1.6 for body text (optimal for Bulgarian Cyrillic)
- **Font Weights**:
  - Regular: 400
  - Medium: 500
  - Semibold: 600
  - Bold: 700

### Spacing System
```
4px   - xs
8px   - sm
12px  - md
16px  - lg
24px  - xl
32px  - 2xl
48px  - 3xl
```

### Component Standards

#### 1. Page Headers
- **Title**: text-2xl, font-semibold, var(--text-primary)
- **Subtitle**: text-sm, var(--text-secondary)
- **Back Button**: Optional, with ChevronLeft icon
- **Actions**: Right-aligned buttons
- **Spacing**: mb-6

#### 2. Cards
- **Background**: var(--bg-card)
- **Border Radius**: 12px (rounded-xl)
- **Padding**: 
  - Small: p-4
  - Medium: p-6 (default)
  - Large: p-8
- **Hover State**: hover:shadow-[var(--glow-indigo)] for interactive cards
- **No borders**: Use tonal layering instead

#### 3. Buttons
- **Primary**: 
  - Background: var(--primary-accent)
  - Color: #ffffff
  - Height: h-11 (md), h-9 (sm), h-12 (lg)
  - Padding: px-4 (md), px-3 (sm), px-6 (lg)
  - Border Radius: rounded-xl
  
- **Secondary**:
  - Background: var(--bg-card)
  - Color: var(--text-primary)
  
- **Ghost**:
  - Background: transparent
  - Color: var(--text-secondary)

- **States**:
  - Hover: opacity-90
  - Active: scale-95
  - Disabled: opacity-50, cursor-not-allowed

#### 4. Badges
- **Small**: px-2 py-0.5 text-xs
- **Medium**: px-3 py-1 text-sm
- **Border Radius**: rounded-lg
- **Variants**:
  - Primary: rgba(99, 102, 241, 0.15) bg, var(--primary-accent) color
  - Success: rgba(34, 197, 94, 0.15) bg, var(--status-success) color
  - Warning: rgba(251, 191, 36, 0.15) bg, var(--status-warning) color
  - Error: rgba(239, 68, 68, 0.15) bg, var(--status-error) color
  - Info: rgba(59, 130, 246, 0.15) bg, var(--status-info) color

#### 5. Form Inputs
- **Height**: h-11
- **Padding**: px-4
- **Border Radius**: rounded-xl
- **Background**: var(--bg-panel)
- **Border**: 1px solid transparent (error: 1px solid var(--status-error))
- **Focus**: No outline, subtle shadow
- **Icons**: Left-aligned, pl-10 for input

#### 6. Tables
- **Border**: Bottom border only, var(--ghost-border)
- **Header**: text-xs, uppercase, tracking-wide, var(--text-secondary)
- **Cell Padding**: px-6 py-4 (desktop), px-4 py-3 (mobile)
- **Row Hover**: hover:bg-opacity-50 for interactive rows
- **No alternating rows**: Clean, minimal design

#### 7. Modals
- **Backdrop**: rgba(6, 14, 32, 0.85) with backdrop-blur-sm
- **Background**: var(--bg-panel)
- **Border**: 1px solid var(--ghost-border)
- **Border Radius**: rounded-2xl
- **Max Width**: sm (28rem), md (42rem), lg (56rem), xl (72rem)
- **Header**: px-6 py-4, border-b
- **Content**: px-6 py-6, overflow-y-auto
- **Footer**: px-6 py-4, border-t

#### 8. Alerts
- **Padding**: p-4
- **Border Radius**: rounded-xl
- **Border**: 1px solid (variant-border)
- **Background**: (variant-bg)
- **Icon**: 20px, flex-shrink-0
- **Variants**:
  - Success: CheckCircle icon
  - Warning: AlertCircle icon
  - Error: XCircle icon
  - Info: Info icon

#### 9. Stats Cards
- **Padding**: p-6
- **Background**: var(--bg-card)
- **Border Radius**: rounded-xl
- **Value**: text-3xl, font-semibold, var(--text-primary)
- **Label**: text-sm, var(--text-secondary)
- **Icon**: w-10 h-10, rounded-lg, (color)15 background
- **Trend**: text-sm, font-medium, (color)

#### 10. Empty States
- **Icon Container**: w-16 h-16, rounded-full, var(--bg-card)
- **Title**: text-base, font-medium, var(--text-primary)
- **Description**: text-sm, var(--text-secondary), max-w-md
- **CTA Button**: Primary button style
- **Padding**: py-16

### Status Indicators
```
Active/Completed: var(--status-success)
In Progress: var(--status-warning)
Scheduled/Confirmed: var(--primary-accent)
Pending: var(--status-info)
Canceled/Error: var(--status-error)
```

### Icon Sizes
- **Small**: 14px-16px
- **Medium**: 18px-20px (default)
- **Large**: 24px

### Grid System
```
Desktop (lg: 1024px+):
- 12-column grid
- gap-6 (24px)
- 2 columns: grid-cols-2
- 3 columns: grid-cols-3
- 4 columns: grid-cols-4

Mobile (< 768px):
- Full width or 2-column
- gap-3 (12px)
```

### Mobile Adaptations
- **Breakpoint**: 768px
- **Bottom Navigation**: Fixed, h-16, 5 primary items
- **Top Bar**: Sticky, h-14
- **Touch Targets**: Minimum 44px height
- **Active States**: active:scale-95 or active:scale-98
- **Compact Stats**: 2-column grid
- **Tab Navigation**: Sticky, horizontal scroll
- **Cards**: Reduced padding (p-4 instead of p-6)

### Animation & Transitions
- **Duration**: 200ms-300ms
- **Easing**: ease-in-out
- **Properties**: opacity, transform, background
- **Hover**: opacity-90, opacity-80
- **Active**: scale-95, scale-98
- **Transitions**: transition-all

### Z-Index Scale
```
0   - Base
10  - Dropdowns
20  - Sticky headers
30  - Modals backdrop
40  - Modal content
50  - Tooltips, toasts
```

### Accessibility
- **Focus States**: Visible outline or shadow
- **Color Contrast**: WCAG AA minimum
- **Touch Targets**: 44px minimum
- **Aria Labels**: For icon-only buttons
- **Keyboard Navigation**: Full support

### Bulgarian Localization
- All interface text in Bulgarian
- Proper Cyrillic rendering with Inter font
- Generous line-height (1.6) for readability
- Date format: DD.MM.YYYY
- Time format: 24-hour (HH:MM)

### Consistency Checklist
✅ Same color palette across all screens
✅ Same typography scale
✅ Same spacing system
✅ Same component styles (buttons, cards, badges)
✅ Same hover/active states
✅ Same border radius values
✅ Same icon sizes
✅ Same status colors
✅ Same modal patterns
✅ Same table styles
✅ Same form inputs
✅ Same empty states
✅ Same mobile breakpoint
✅ All text in Bulgarian
✅ Tonal layering (no borders except subtle)
