# Covalynce — Design System v4

**Status:** Obsidian · Neon · Ledger  
**Last updated:** June 2026

## Principles

- **The page is a ledger** — indexed sections (`§ 01`), hairline rules, tabular mono figures. Structure comes from lines, not boxes.
- **Committed color** — obsidian (`#030304`) drenches the first fold and the closing CTA; the body is cool pearl paper; neon (`#66FCF1`) is the single electric accent, used sparingly as the "active row" color.
- **Sharp** — `--radius: 0.125rem`, 1px borders, heavy `border-t-2` leading rules on lists and tables.
- **No identical card grids, no icon-above-heading tiles, no side-stripe accents.**

## Color

| Role | Token |
|------|--------|
| Canvas (light) | `--background` cool pearl `oklch(0.965 0.007 195)` |
| Ink band (always dark) | `[data-surface="section-ink"]` obsidian, neon primary — closing CTA only |
| Ink band (adaptive) | `.landing-ink-adaptive` — paper in light mode, obsidian in dark — header + hero |
| Text | `--foreground` near-black, teal-tinted |
| Accent | `--landing-accent` teal (light) / `--brand-neon` (dark, ink) |
| Logo mark | `--brand-mark` obsidian on light, neon on dark |

Landing scope: `[data-surface="landing"]`. The theme toggle is real: light mode reads as a printed statement (paper everywhere except the obsidian closing CTA); dark mode is the full obsidian drench.

## Typography

| Use | Font |
|-----|------|
| Display / headlines / metrics | Archivo (`--font-archivo`, `.font-display`, weight 600, -0.035em) |
| UI & body | Inter |
| Figures, labels, section indexes | JetBrains Mono (tabular) |

Headlines use `.landing-headline`: `clamp(2.125rem, 1.3rem + 3vw, 3.625rem)`.

## Ledger utilities (`globals.css`, global — shared by landing and app)

- `.ledger-index` — mono section/row index, accent colored
- `.ledger-value` — tabular mono figure
- `.ledger-label` — mono uppercase micro-label (metric cards, sidebar groups)
- `.ledger-leader` — dotted leader between label and value
- `.ledger-lines` — faint ruled-paper background (landing scope)
- `.ink-glow` — radial top glow, opt-in for ink bands

App alignment: `.page-title` is Archivo; metric card labels and sidebar group
labels use `.ledger-label`; metric values are tabular mono.

## Landing structure (single pass)

§ 00 Hero (ink, asymmetric: headline left, product right) + proof ledger strip
→ § 01 Problem → § 02 Product (tabbed window) → § 03 How it works (ruled columns)
→ § 04 Platform (selector rail + pinned diagram) → § 05 Integrations (provider table)
→ § 06 Audience (ruled persona columns) → § 07 FAQ → § 08 Closing entry (ink CTA)

## Files

- Tokens + utilities: `prototype/src/app/globals.css`
- Copy + SEO: `prototype/src/lib/landing-copy.ts`
- Section shell: `prototype/src/components/landing/landing-section.tsx`
- Page: `prototype/src/components/landing/landing-page-client.tsx`
- Brand mark: `prototype/src/components/brand/covalynce-mark-svg.tsx` (adaptive / tile / neon)
