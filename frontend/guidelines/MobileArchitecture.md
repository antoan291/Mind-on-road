# KursantAI / DriveAdmin - Mobile Architecture

## Mobile Obsidian Navigator Design System

Same premium, dark-themed interface adapted for mobile devices with touch-optimized interactions.

---

## Mobile Navigation Model

### Bottom Navigation Bar
Fixed navigation with 5 primary sections:
1. **Табло** (Dashboard) - Home screen
2. **Курсисти** (Students) - Student management
3. **График** (Schedule) - Daily schedule
4. **Известия** (Notifications) - Alerts and updates
5. **Меню** (Menu) - Full menu overlay

### Top Bar
- Compact logo (KA badge)
- Page context
- Search icon
- 56px height (14 * 4px)

### Full Menu Overlay
- Slides in from bottom navigation
- Full-screen experience
- All secondary navigation items
- User profile card at bottom

---

## Mobile Layout Structure

```
┌─────────────────────────────┐
│  Top Bar (56px)             │
├─────────────────────────────┤
│                             │
│  Scrollable Content         │
│                             │
│                             │
├─────────────────────────────┤
│  Bottom Nav (64px)          │
└─────────────────────────────┘
```

**Key Measurements:**
- Top bar: 56px (h-14)
- Bottom nav: 64px (h-16)
- Safe padding from bottom nav: 80px (pb-20)
- Minimum tap target: 44px
- Comfortable tap target: 48-56px
- Card padding: 16px (p-4)
- Page padding: 16px (p-4)

---

## Mobile Page Patterns

### 1. Mobile Dashboard

**Components:**
- Quick stats (2-column grid)
- Today's schedule cards
- AI insights card
- Quick action buttons

**Features:**
- Swipeable stat cards (future)
- Tappable schedule items
- Direct navigation to student details

**File:** `/src/app/pages/mobile/MobileDashboardPage.tsx`

---

### 2. Mobile List Page (Students)

**Components:**
- Search bar with filter button
- Student cards with:
  - Avatar
  - Name and category
  - Status badge
  - Progress bar
  - Next lesson info

**Interactions:**
- Pull to refresh (future)
- Tap card to view details
- Search filters

**File:** `/src/app/pages/mobile/MobileStudentsPage.tsx`

---

### 3. Mobile Detail Page

**Components:**
- Back navigation
- Action menu (3-dot)
- Profile card
- Contact info grid
- Progress card
- Recent lessons list
- Sticky bottom actions

**Features:**
- Action sheet for quick actions
- Direct call/edit buttons
- Scrollable content with sticky CTAs

**File:** `/src/app/pages/mobile/MobileStudentDetailPage.tsx`

---

### 4. Mobile Form Page

**Components:**
- Sectioned form cards
- Large input fields (48px height)
- Dropdowns with native feel
- Sticky submit button

**Features:**
- One section at a time
- Clear field labels
- Helpful validation
- Success alerts

**File:** `/src/app/pages/mobile/MobileStudentFormPage.tsx`

---

### 5. Mobile Schedule Page

**Components:**
- Date selector
- Timeline view
- Schedule cards with:
  - Time display
  - Student info
  - Instructor and location
  - Status badges

**Features:**
- Swipe between dates (future)
- Tap to view details
- Visual timeline

**File:** `/src/app/pages/mobile/MobileSchedulePage.tsx`

---

### 6. Mobile Notifications Page

**Components:**
- Unread count in header
- Notification cards with:
  - Type icon
  - Title and message
  - Timestamp
  - Unread indicator

**Features:**
- Mark all read button
- Tap to view details
- Visual grouping by read status

**File:** `/src/app/pages/mobile/MobileNotificationsPage.tsx`

---

## Mobile UI Components

### MobilePageHeader
```tsx
<MobilePageHeader
  title="Заглавие"
  subtitle="Под заглавие"
  showBack={true}
  actions={<button>...</button>}
/>
```

**Features:**
- Back button when needed
- Title with optional subtitle
- Action buttons (right side)
- Truncated text for long titles

---

### BottomSheet
```tsx
<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Заглавие"
  snapPoint="auto"
>
  {children}
</BottomSheet>
```

**Snap Points:**
- `auto` - Fits content (max 85vh)
- `half` - 50vh
- `full` - 100vh

**Features:**
- Drag handle
- Backdrop blur
- Slide-up animation
- Swipe to dismiss (future)

---

### ActionSheet
```tsx
<ActionSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Действия"
  actions={[
    {
      label: 'Редактирай',
      icon: <Edit />,
      onClick: () => {},
      variant: 'primary',
    },
  ]}
/>
```

**Variants:**
- `default` - Card background
- `primary` - Indigo gradient
- `destructive` - Error red

---

## Mobile-Specific Design Decisions

### Touch Targets
- **Minimum:** 44x44px (iOS guideline)
- **Comfortable:** 48x48px
- **Primary actions:** 56px height
- **Bottom nav items:** 64px width minimum

### Typography
- Same Inter font family
- Slightly smaller headings on mobile
- Generous line-height maintained
- Text truncation with ellipsis

### Spacing
- Consistent 16px padding
- 12px gaps between cards
- 16px between sections
- No horizontal scroll

### Colors
- Exact same color palette
- Same tonal layering
- Indigo primary accent
- Purple AI accent (sparingly)

### Cards
- Rounded corners: 12px (rounded-xl)
- Tonal backgrounds (no borders)
- Touch-optimized padding
- Clear active states

### Interactions
- Tap feedback (subtle bg change)
- Smooth transitions (200ms)
- Native-feeling scrolling
- Clear loading states

---

## Responsive Strategy

### Breakpoint
- Mobile: < 1024px (lg breakpoint)
- Desktop: ≥ 1024px

### Implementation
```tsx
// ResponsiveLayout.tsx
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 1024);
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

return isMobile ? <MobileLayout /> : <AppLayout />;
```

Each major page has a responsive wrapper that renders the appropriate version.

---

## Mobile Patterns Library

### 1. Stat Card
Small metric display with icon, label, value, and subtitle.

### 2. Schedule Card
Timeline-style card with time, student, instructor, location.

### 3. Student Card
List item with avatar, name, category, progress bar, status.

### 4. Notification Card
Alert-style card with icon, title, message, timestamp, unread indicator.

### 5. Info Row
Contact detail row with icon, label, and value.

### 6. Progress Item
Small progress indicator with icon, label, and status.

### 7. Lesson Card
Compact lesson history item with date, time, type, status.

---

## Sticky Bottom Actions

For detail and form pages:
```tsx
<div 
  className="fixed bottom-16 left-0 right-0 p-4 border-t"
  style={{ 
    background: 'var(--bg-panel)',
    borderColor: 'var(--ghost-border)'
  }}
>
  <button>Primary Action</button>
</div>
```

**Key Points:**
- `bottom-16` - Above bottom nav (64px)
- Full width with 16px padding
- Subtle top border
- Panel background
- Always accessible

---

## Mobile Form Guidelines

1. **Section cards** - Group related fields
2. **Large inputs** - 48px height minimum
3. **Clear labels** - Above inputs, required indicators
4. **Single column** - Never side-by-side on mobile
5. **Sticky submit** - Always visible at bottom
6. **Inline validation** - Show errors immediately
7. **Success feedback** - Clear confirmation messages

---

## Animation & Transitions

### Bottom Sheet
```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Transitions
- All interactive elements: 200ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Properties: background, shadow, transform

---

## Mobile Performance

### Optimizations
- Lazy load images
- Virtual scrolling for long lists (future)
- Debounced search input
- Optimistic UI updates
- Minimal re-renders

### Loading States
- Skeleton screens (future)
- Loading spinners
- Progressive enhancement
- Graceful degradation

---

## Mobile Accessibility

- Large touch targets (44px minimum)
- High contrast text
- Clear focus states
- Semantic HTML
- ARIA labels where needed
- Readable font sizes (16px minimum)
- Generous spacing

---

## Mobile Testing Checklist

- [ ] All touch targets ≥ 44px
- [ ] No horizontal scroll
- [ ] Text is readable (16px+)
- [ ] Forms work on iOS/Android keyboards
- [ ] Bottom nav doesn't overlap content
- [ ] Sticky actions work correctly
- [ ] Back navigation works
- [ ] Search and filters functional
- [ ] Status badges visible
- [ ] Cards are tappable
- [ ] Animations smooth (60fps)
- [ ] No layout shift on load

---

## File Structure

```
/src/app/
├── components/
│   ├── layouts/
│   │   ├── AppLayout.tsx           # Desktop layout
│   │   ├── MobileLayout.tsx        # Mobile layout
│   │   └── ResponsiveLayout.tsx    # Responsive wrapper
│   └── mobile/
│       ├── MobilePageHeader.tsx    # Mobile header
│       └── BottomSheet.tsx         # Bottom sheet + action sheet
└── pages/
    ├── mobile/
    │   ├── MobileDashboardPage.tsx
    │   ├── MobileStudentsPage.tsx
    │   ├── MobileStudentDetailPage.tsx
    │   ├── MobileStudentFormPage.tsx
    │   ├── MobileSchedulePage.tsx
    │   └── MobileNotificationsPage.tsx
    ├── ResponsiveDashboardPage.tsx
    ├── ResponsiveStudentsPage.tsx
    └── ...
```

---

## Mobile vs Desktop: Same Product

### Same
✅ Color palette (exact)  
✅ Typography (Inter font)  
✅ Tonal layering  
✅ Indigo primary accent  
✅ Purple AI accent  
✅ Status colors  
✅ Border radius (12px)  
✅ Component logic  
✅ Data structures  
✅ Business rules  

### Adapted
📱 Navigation model (bottom nav)  
📱 Layout density (more spacious)  
📱 Touch targets (larger)  
📱 Action patterns (sheets vs modals)  
📱 Form layout (single column)  
📱 Table → Card lists  
📱 Sticky actions  
📱 Simplified headers  

---

## Future Mobile Enhancements

- [ ] Pull to refresh
- [ ] Swipe gestures
- [ ] Haptic feedback
- [ ] Voice input
- [ ] Camera integration (document scanning)
- [ ] Offline mode
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Dark/light mode toggle
- [ ] Customizable home widgets

---

The mobile version maintains the premium "Obsidian Navigator" feel while being perfectly adapted for touch interactions and one-handed use. It never feels like a different product - just the same excellent system, carefully optimized for mobile.
