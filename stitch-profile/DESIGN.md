# Design System Specification: The Obsidian Navigator

## 1. Overview & Creative North Star
**Creative North Star: The Obsidian Navigator**
The design system for this driving school CRM is built on the intersection of high-performance automotive telemetry (Tesla) and hyper-efficient engineering workflows (Linear). It avoids the "template" look by eschewing standard grids in favor of **Tonal Layering** and **Intentional Asymmetry**. 

The goal is to make the management of a driving school feel like piloting a high-end electric vehicle. We move beyond generic "dark mode" by using deep slate tones (#0F172A) layered with rich, obsidian-like surfaces, punctuated by vivid, neon-functional accents that represent AI-driven insights.

---

## 2. Colors: Tonal Depth & Functional Vibrancy
Our palette is rooted in a "Rich Slate" foundation. Depth is not achieved through light, but through the absence of it and the strategic placement of "lit" surfaces.

### Surface Hierarchy & The "No-Line" Rule
*   **The No-Line Rule:** To maintain a premium, seamless feel, 1px solid borders are prohibited for sectioning large layout areas. Boundaries between the navigation, sidebar, and main content must be defined solely through background shifts.
    *   **Page Background:** `surface-dim` (#060e20).
    *   **Sectioning:** Use `surface-container-low` (#091328) for secondary panels.
*   **Surface Hierarchy:** Treat the UI as physical layers of smoked glass. 
    *   *Level 0 (Base):* `surface` (#060e20).
    *   *Level 1 (Cards):* `surface-container-highest` (#192540).
    *   *Level 2 (Popovers/Modals):* `surface-bright` (#1f2b49).

### The "Glass & Gradient" Rule
To elevate the "AI-powered" nature of the CRM, floating elements (modals, tooltips, and the AI Purple Violet `#A78BFA` modules) should utilize glassmorphism. Use a semi-transparent `surface-variant` with a 12px `backdrop-blur`. 

**Signature Texture:** Main Action buttons (Primary Indigo `#6366F1`) should feature a subtle linear gradient transitioning to `primary-dim` (#6063ee) at a 135-degree angle to provide a tactile, "lit from within" quality.

---

## 3. Typography: Editorial Authority
We use **Inter** as our sole typeface, relying on extreme weight and scale contrast to create an editorial feel.

*   **Display & Headlines:** Use `headline-lg` (2rem) for dashboard overviews. Tracking should be set to -0.02em for a tighter, "machined" look.
*   **The Utility Layer:** Labels (`label-sm`, 11px/0.6875rem) must be **Uppercase** with a +0.05em letter spacing. This mimics the "instrument cluster" feel of a high-end dashboard.
*   **Bulgarian Localization:** All typography must maintain vertical rhythm for Cyrillic characters. Ensure line-heights are 1.5x for body text (`body-md`) to handle the visual density of Bulgarian text.
    *   *Example:* **1 400,00 лв** (Primary Slate-100).
    *   *Date Format:* **DD.MM.YYYY** (Secondary Slate-400).

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "web 2.0." In this system, we use **Ambient Glows** and **Tonal Stacking**.

*   **The Layering Principle:** Place a `surface-container-highest` card on a `surface` background. The 13% lightness difference creates a natural edge without a border.
*   **Ambient Shadows:** For floating elements, use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. 
*   **The Ghost Border Fallback:** If accessibility requires a border (e.g., in high-density data tables), use a **Ghost Border**. This is the `outline-variant` (#40485d) at 20% opacity. 
*   **Interactive Glow:** On hover, Primary Indigo elements should cast a soft, 8px blur glow using the `primary` token at 30% opacity.

---

## 5. Components: Precision Elements

### Buttons & Inputs
*   **Primary Action:** Height: 40px. Radius: `md` (0.75rem). Background: Gradient Indigo.
*   **Form Inputs:** Height: 44px. Background: `surface-container-lowest` (#000000). Border: `outline-variant` (#40485d). Focus state: 1px solid `primary` (#a3a6ff).
*   **AI Logic Inputs:** For AI-powered scheduling, use a `secondary-container` (#4f319c) background with a pulsating "Purple Violet" glow.

### Status & Feedback
*   **Pill Badges:** 10% opacity backgrounds.
    *   *Success:* Text `on-tertiary-fixed` (#004b33), BG `tertiary` (#cdffe3) @ 10%.
    *   *Danger:* Text `error` (#ff6e84), BG `error` @ 10%.
*   **Data Lists:** Forbid divider lines. Use `spacing-6` (1.5rem) of vertical white space or alternating `surface-container-low` and `surface-container-high` backgrounds for row separation.

### Driving School Specifics
*   **Telemetry Cards:** Use for student progress. These should feature mini-sparklines using `primary` (Indigo) and `secondary` (Violet).
*   **Route Maps:** Map overlays should be desaturated to -80% to ensure the functional UI colors (`error`, `success`) pop.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `surface-container` shifts to create hierarchy.
*   **Do** use wide margins (`spacing-10` to `spacing-16`) to let data breathe.
*   **Do** ensure all interactive states (hover, active) have a 150ms transition.
*   **Do** format all currency as "1 234,56 лв" with a non-breaking space.

### Don't
*   **Don't** use 100% opaque, high-contrast white borders.
*   **Don't** use standard "Grey" shadows; always use black with low opacity or tinted shadows.
*   **Don't** use center-alignment for dashboard headers; stick to a strict, left-aligned editorial grid.
*   **Don't** use more than one "AI Purple Violet" element per view; it is a signature accent, not a primary color.