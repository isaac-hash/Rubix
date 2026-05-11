---
name: Rubix Infrastructure
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#c6cee8'
  on-tertiary: '#283044'
  tertiary-container: '#abb2cc'
  on-tertiary-container: '#3d455a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system establishes a visual language of "Industrial Sophistication." It is designed for Rubix, an infrastructure-level fintech solution for Africa, where the UI must convey both the raw strength of heavy industry and the refined precision of modern global finance.

The style is **Corporate Modern** with a **Tactile** edge. It avoids the fluff of consumer-grade apps in favor of a "Dashboard of Power" aesthetic. Depth is achieved through layering obsidian surfaces, utilizing subtle metallic gold outlines to represent value, and emerald glows to signal systemic health and growth. The interface should feel like a high-end physical console—sturdy, reliable, and high-performance.

## Colors

The palette is anchored in **Obsidian (#020617)** for the deepest background layers, providing a vast sense of space. **Deep Slate (#0F172A)** is used for elevated containers and cards, creating a subtle contrast that guides the eye.

**Rich Gold (#D4AF37)** is the "Action Color." It is used sparingly for primary buttons, critical progress indicators, and active states to signify premium value. **Emerald (#10B981)** serves as the "Trust Color," applied to positive growth metrics, success confirmations, and "system-online" indicators. 

Typography and iconography primarily use **Slate 50 (#F8FAFC)** for maximum legibility against the dark void, with lower-priority text retreating into muted grays.

## Typography

This design system utilizes a tri-font strategy to balance character and utility. **Hanken Grotesk** provides a sharp, contemporary edge for headlines, suggesting technical precision. **Inter** is the workhorse for all body copy and data entry, chosen for its unparalleled legibility in complex fintech environments. **JetBrains Mono** is introduced for labels, transaction IDs, and secondary metrics to reinforce the "infrastructure" and "data-driven" nature of the product.

Hierarchy is enforced strictly: large display type is reserved for account balances and high-level summaries, while monospaced labels provide a technical texture to the UI.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop (12 columns, 1280px max-width) and a **Fluid Grid** on mobile (4 columns). A strict 4px/8px rhythm is maintained to ensure a tight, engineered feel.

- **Margins:** 24px on mobile, 40px on tablet, and auto-centered on desktop.
- **Sectioning:** Large vertical spacing (64px+) is used to separate distinct functional areas (e.g., "Wallet Overview" vs "Recent Transactions"), while internal card padding remains compact (24px) to maximize information density.
- **Data Tables:** Use 12px vertical cell padding to balance density with readability, essential for high-volume financial logs.

## Elevation & Depth

Depth in this design system is architectural rather than atmospheric. We use **Tonal Layering** combined with **Low-contrast Outlines**.

1.  **Level 0 (Floor):** Obsidian (#020617) - used for the main background.
2.  **Level 1 (Foundation):** Deep Slate (#0F172A) - used for primary cards and content areas. Surfaces at this level receive a 1px border of `rgba(255,255,255,0.05)`.
3.  **Level 2 (Interaction):** Active elements or modals. These feature a **Subtle Gold Border** (#D4AF37 at 20% opacity) and a soft **Emerald Glow** (inner shadow) if the status is active/positive.

Shadows are rarely used. Instead, depth is communicated through 1px strokes that catch the "light," mimicking the chamfered edges of precision-machined hardware.

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding takes the "edge" off the industrial aesthetic, making the professional environment feel polished rather than hostile. 

- **Primary Buttons:** 4px radius (Soft).
- **Secondary Cards:** 8px radius (Large).
- **Status Pills:** Fully rounded (Pill) to contrast against the predominantly rectangular grid.
- **Iconography:** Use thick 2px strokes with slightly rounded caps to match the font-weight of the UI.

## Components

### Buttons
- **Primary:** Solid Gold (#D4AF37) with Slate (#0F172A) text. High impact, reserved for "Send," "Confirm," or "Invest."
- **Secondary:** Ghost style with a 1px gold border and gold text. Used for "Add Funds" or "Edit."
- **Tertiary:** Transparent background with Slate 300 text.

### Inputs
- Background: Deep Slate (#0F172A).
- Border: 1px `rgba(255,255,255,0.1)`. 
- Focus State: Border transitions to Gold (#D4AF37) with a very faint gold outer glow.

### Cards
- Standard containers use the Deep Slate background.
- For high-trust metrics (e.g., "Yield" or "Success Rate"), cards feature a top-border accent in Emerald (#10B981) and a faint emerald bottom-glow.

### Success States & Metrics
- All positive financial trends must use the Emerald (#10B981) color.
- Success toasts should use an Obsidian background with a prominent Emerald icon and a subtle 1px Emerald border.

### Progress Bars
- Track: Obsidian (#020617).
- Indicator: Gradient from Gold (#D4AF37) to a slightly lighter brass tone, giving a metallic, moving-light effect.