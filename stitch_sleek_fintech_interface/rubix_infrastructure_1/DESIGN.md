---
name: Rubix Infrastructure
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#181c1d'
  surface-container: '#1c2021'
  surface-container-high: '#272b2c'
  surface-container-highest: '#313536'
  on-surface: '#e0e3e4'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#e0e3e4'
  inverse-on-surface: '#2d3132'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#95d3ba'
  on-secondary: '#003829'
  secondary-container: '#0b513d'
  on-secondary-container: '#83c2a9'
  tertiary: '#b7c8e1'
  on-tertiary: '#213145'
  tertiary-container: '#94a4bd'
  on-tertiary-container: '#2a3a4f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#101415'
  on-background: '#e0e3e4'
  surface-variant: '#313536'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style

This design system is engineered for the "infrastructure" layer of high-stakes finance—evoking a sense of architectural stability, absolute precision, and technical superiority. The brand personality is clinical, efficient, and sophisticated, targeting institutional users who value data density and performance over decorative flair.

The UI style is a fusion of **High-Density Minimalism** and **Technical Professionalism**. It prioritizes information architecture through subtle structural borders rather than heavy shadows or vibrant gradients. By utilizing an obsidian-based foundation with electric emerald accents, the visual language signals a shift from "old wealth" (gold/brass) to "new digital liquidity" (code/emerald). The aesthetic is uncompromisingly dark-mode first, reflecting the "always-on" nature of global financial infrastructure.

## Colors

The palette is anchored in **Obsidian (#0b0f10)** and **Deep Slate (#101415)** to create a canvas with near-infinite depth. This environment allows the **Vibrant Emerald (#10b981)** to act as a high-visibility beacon for primary actions and system-critical data points.

- **Primary Accent:** Emerald Green is the signature of the design system, used sparingly but intentionally to guide the eye to conversion points and active states.
- **Success States:** A deep, high-trust Forest Green is reserved for completed transactions and verified statuses, providing a calmer psychological contrast to the vibrant primary green.
- **Typography:** Text relies on a hierarchy of Crisp White for headings and Light Slate for metadata, ensuring legibility against the dark backgrounds without causing eye strain in high-density views.
- **Structural Lines:** Borders use a low-impact Slate to define containers without cluttering the visual field.

## Typography

This design system utilizes **Hanken Grotesk** for its technical precision and geometric clarity. The font's open counters and clean apertures make it ideal for the high-density data tables and complex financial dashboards central to the product.

The typographic scale is optimized for information density. **Labels** use uppercase styling with increased letter spacing to provide clear categorization in compact spaces. **Body text** maintains a generous line height to ensure readability in long-form reports. **Display sizes** are tight and impactful, intended for high-level portfolio overviews and primary balance displays. On mobile, headlines scale down to preserve vertical space and prevent awkward line breaks in multi-column layouts.

## Layout & Spacing

The layout philosophy follows a strict **8px baseline grid** to maintain a professional, structured rhythm. It employs a **12-column fluid grid** for desktop, optimized to display vast amounts of financial data without feeling cramped. 

- **Density:** Spacing is tighter than consumer-facing apps to maximize "above-the-fold" data. 
- **Margins:** Desktop views utilize a 24px outer margin, while mobile drops to 16px to maximize screen real estate.
- **Breakpoints:**
  - *Mobile:* 4-column layout, stacked cards, full-width buttons.
  - *Tablet:* 8-column layout, introduction of sidebars.
  - *Desktop:* 12-column layout with a fixed-width navigation rail (240px).
- **Alignment:** Elements are strictly aligned to the grid, emphasizing the "infrastructure" metaphor of the brand.

## Elevation & Depth

To maintain a sleek and modern technical feel, this design system avoids traditional drop shadows. Instead, it uses **Tonal Layering** and **Low-Contrast Outlines** to communicate hierarchy.

1.  **Level 0 (Base):** The darkest color (#0b0f10), used for the background of the entire application.
2.  **Level 1 (Surface):** The primary container color (#101415), used for cards and modular sections.
3.  **Level 2 (Interaction):** Hover states and active selections use a slightly lighter slate or the primary emerald outline.
4.  **Separation:** 1px borders in Slate (#1E293B) are used to define boundaries between content blocks.
5.  **Focus:** When an element is active or focused, it receives a 1px solid Emerald border. This "glow-less" approach ensures the UI feels like a high-performance tool rather than a toy.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding provides just enough modern character to feel contemporary without sacrificing the rigid, professional integrity of the interface.

- **Buttons & Inputs:** Use the standard `rounded` (4px) setting for a crisp, architectural finish.
- **Large Cards:** May utilize `rounded-lg` (8px) to softly frame larger data modules.
- **Icon Containers:** Stay consistent with the 4px radius to ensure they align perfectly within technical lists.
- **Exclusion:** The only exception to the 4px rule are **Status Pills**, which are fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

Components are designed for high-frequency interaction and data clarity.

- **Buttons:** 
  - *Primary:* Solid Emerald Green background with Black/Obsidian text for maximum contrast.
  - *Secondary:* Ghost style with a 1px Slate border and Emerald text.
  - *Tertiary:* Plain text with Emerald color, used for low-priority actions.
- **Inputs:** Darker than the surface background (#080a0b) with a 1px Slate border. On focus, the border transitions to Emerald.
- **Data Tables:** High-density, 12px font size, with alternating row highlights (subtle slate tint) and sticky headers. No vertical borders; horizontal borders only to define rows.
- **Chips/Badges:** Used for status. Success uses the Forest Green; Neutral uses Slate.
- **Cards:** No shadows. Defined by a 1px Slate border and the #101415 surface color.
- **Navigation:** A vertical sidebar with high-contrast active states (Emerald vertical line on the left edge).