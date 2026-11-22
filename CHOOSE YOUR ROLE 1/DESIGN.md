---
name: DRYFTQ Collect
colors:
  surface: '#0e131e'
  surface-dim: '#0e131e'
  surface-bright: '#343945'
  surface-container-lowest: '#080e18'
  surface-container-low: '#161c26'
  surface-container: '#1a202a'
  surface-container-high: '#242a35'
  surface-container-highest: '#2f3540'
  on-surface: '#dde2f1'
  on-surface-variant: '#e3bfb3'
  inverse-surface: '#dde2f1'
  inverse-on-surface: '#2b313c'
  outline: '#aa8a7f'
  outline-variant: '#5a4138'
  surface-tint: '#ffb59b'
  primary: '#ffb59b'
  on-primary: '#5c1a00'
  primary-container: '#f85f1e'
  on-primary-container: '#501600'
  inverse-primary: '#aa3700'
  secondary: '#98cbff'
  on-secondary: '#003354'
  secondary-container: '#2e97e3'
  on-secondary-container: '#002c4a'
  tertiary: '#9bcbff'
  on-tertiary: '#003256'
  tertiary-container: '#1696ed'
  on-tertiary-container: '#002c4b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#822800'
  secondary-fixed: '#cfe5ff'
  secondary-fixed-dim: '#98cbff'
  on-secondary-fixed: '#001d33'
  on-secondary-fixed-variant: '#004a77'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#9bcbff'
  on-tertiary-fixed: '#001d34'
  on-tertiary-fixed-variant: '#004a79'
  background: '#0e131e'
  on-background: '#dde2f1'
  surface-variant: '#2f3540'
typography:
  display-lg:
    fontFamily: IBM Plex Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  title-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

**Brand Personality & Audience:**
This design system powers an enterprise industrial web application built for operations managers, field engineers, and plant supervisors. The interface must project precision, reliability, and operational authority. Every visual element serves data clarity and rapid decision-making under high-stakes industrial conditions.

**Emotional Response:**
The UI evokes focus, control, and technical confidence. Deep, low-glare dark surfaces reduce eye strain during extended monitoring sessions, while high-contrast typographic hierarchy and purposeful color accents draw immediate attention to critical actions and system states.

**Design Style:**
A **Corporate / Modern** foundation paired with **High-Contrast / Bold** functional accents. Surfaces are strictly flat and solid—no gradients, no glassmorphism, and no decorative blurs. Visual structure relies on disciplined tonal layering, crisp 1px borders, and unambiguous alignment.

## Colors

The palette is engineered for dark-mode industrial legibility, pairing deep navy-charcoal surfaces with high-visibility signal accents. All surfaces are flat and opaque.

- **Background & Surface Hierarchy:**
  - **Main Background (`#050A14`):** The deepest canvas layer, used for the application shell and primary viewport background.
  - **Container Surface (`#080D19`):** Secondary structural layer for sidebars, navigation rails, and grouped panel wrappers.
  - **Card Surface (`#151D2B`):** Elevated content layer for data cards, modals, tables, and interactive widgets.
- **Accents:**
  - **Primary Accent (`#F15A19`):** Reserved for primary calls-to-action, active navigation indicators, and critical operational triggers. Use `#F36A19` for hover and active interactive states.
  - **Secondary Accent (`#3299E6`):** Used for informational states, secondary actions, active data links, and telemetry highlights.
- **Typography & Borders:**
  - **Headings (`#FFFFFF`):** Crisp white for primary titles, KPI values, and section headers.
  - **Body Text (`#C5C9D2`):** Light grey for readable body copy, table cells, and secondary descriptions.
  - **Subtle Borders (`#626773`):** Used at 1px weight (and reduced opacity where appropriate) to define structural boundaries without visual clutter.

## Typography

The typographic system pairs **IBM Plex Sans** for structured, authoritative headings with **Inter** for high-legibility body copy, data tables, and UI labels.

- **Hierarchy & Contrast:** All `display-*`, `headline-*`, and `title-*` roles render in `#FFFFFF` to establish immediate scanning anchors. `body-*` roles render in `#C5C9D2` for comfortable sustained reading.
- **Numeric Precision:** When displaying industrial telemetry, timestamps, or tabular metrics, enable `font-variant-numeric: tabular-nums` on `Inter` so columns align vertically without jitter.
- **Responsive Scaling:** `display-lg` (40px) scales down to `display-lg-mobile` (28px) on viewports below `768px` to preserve layout integrity on compact screens.

## Layout & Spacing

The layout uses a **12-column fluid grid** designed to maximize screen real estate for data-dense enterprise dashboards, telemetry views, and operational tables.

- **Grid & Rhythm:** Columns are separated by a `1rem` (`16px`) `gutter`, with a `1.5rem` (`24px`) outer `margin` on desktop viewports. Component internal padding and element gaps strictly follow the `space-*` scale (`0.25rem` to `2rem`).
- **Breakpoints & Adaptation:**
  - **Desktop (`>= 1280px`):** Full 12-column grid with persistent left navigation rail (`240px`–`280px`) on `#080D19` container surface. Multi-column card grids (3-up or 4-up) sit cleanly within the main `#050A14` canvas.
  - **Tablet (`768px` – `1279px`):** 8-column fluid grid. The navigation rail collapses to an icon-only rail or drawer, and 4-column card rows reflow into 2x2 grids.
  - **Mobile (`< 768px`):** 4-column fluid grid with `1rem` outer margins. All multi-column panels stack vertically, and wide data tables scroll horizontally within their card containers.

## Elevation & Depth

Visual hierarchy is achieved exclusively through **tonal layers** and **low-contrast outlines**—never through drop shadows, gradients, or glassmorphism.

- **Tonal Layering:** Depth progresses from the darkest base (`#050A14` main background) up to `#080D19` (structural containers and navigation) and finally to `#151D2B` (interactive cards, popovers, and modals).
- **Subtle Borders:** Every elevated surface (`#151D2B`) and structural container (`#080D19`) is crisply bounded by a `1px solid` border using `#626773` (or `#626773` at 30%–40% opacity for internal dividers). This ensures clear separation between adjacent data modules in low-light environments.

## Shapes

The design system uses a **Soft (`1`)** roundedness level (`0.25rem` / `4px` base radius, `0.5rem` for `rounded-lg`, `0.75rem` for `rounded-xl`). This slight softening of sharp corners feels engineered and industrial while avoiding the harshness of `0px` edges or the overly casual feel of pill-shaped containers.

- **Buttons, Inputs & Badges:** `0.25rem` (`4px`) radius.
- **Cards & Containers:** `0.5rem` (`8px`) radius (`rounded-lg`).
- **Modals & Drawers:** `0.75rem` (`12px`) radius (`rounded-xl`).

## Components

All components adhere to flat, solid surfaces, `1px` `#626773` borders, and `0.25rem`–`0.5rem` corner radii.

- **Buttons:**
  - *Primary:* Solid `#F15A19` background, `#FFFFFF` `label-lg` text, `0.25rem` radius. Hover transitions to `#F36A19`.
  - *Secondary:* Transparent or `#151D2B` background, `1px solid #626773` border, `#FFFFFF` text. Hover shifts border to `#3299E6`.
  - *Ghost / Tertiary:* Transparent background, `#3299E6` text for inline or low-emphasis actions.
- **Cards:**
  - `#151D2B` surface, `1px solid #626773` border, `0.5rem` radius, `space-lg` (`1.5rem`) internal padding. Card headers use `title-md` (`#FFFFFF`) with an optional `1px` bottom divider.
- **Input Fields:**
  - `#080D19` or `#050A14` background, `1px solid #626773` border, `0.25rem` radius, `#FFFFFF` input text, `#C5C9D2` placeholder. Focus state replaces border color with `#3299E6` (no outer glow).
- **Chips & Status Badges:**
  - Compact `0.25rem` radius, `label-sm` uppercase text. Neutral chips use `#151D2B` with `#626773` border; active/informational chips use `#3299E6` border and text; critical/alert chips use `#F15A19`.
- **Checkboxes & Radio Buttons:**
  - `1px solid #626773` border on `#080D19` background. Checked state fills with `#F15A19` and a crisp `#FFFFFF` indicator.
- **Lists & Data Tables:**
  - Hosted inside `#151D2B` cards. Header rows use `label-sm` (`#C5C9D2`) on `#080D19` background with a `1px` `#626773` bottom border. Data rows use `body-md` (`#C5C9D2`) with `1px` horizontal dividers and subtle `#080D19` hover states.
- **Industrial Telemetry & KPIs:**
  - KPI cards pair `label-md` (`#C5C9D2`) metric labels with `headline-lg` (`#FFFFFF`, tabular numerals) values and a `2px` left accent bar (`#F15A19` or `#3299E6`) to indicate operational status.