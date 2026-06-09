# Covalynce — Design System v3

**Status:** Ivory · Sharp · Landing + app unified  
**Last updated:** June 2026

## Principles

- **Ivory canvas** — warm `oklch(0.955 0.022 78)`, not clinical white
- **Sharp** — `--radius: 0.125rem`, 1px borders, no soft shadows or glows
- **One accent** — ink indigo `oklch(0.38 0.14 258)` for CTAs and active UI
- **Copy** — short, SEO in metadata; on-page text is punchy, not explanatory

## Color

| Role | Token |
|------|--------|
| Canvas | `--background` ivory |
| Card | `--card` lighter ivory |
| Border | `--border` warm gray, high contrast |
| Text | `--foreground` near-black ink |
| Accent | `--primary` |

Marketing ink band: `[data-surface="section-ink"]` for final CTA.

## Typography

| Use | Font |
|-----|------|
| UI & body | Inter |
| Landing headlines | Instrument Serif (`.font-display`, `.landing-headline`) |
| Metrics / API | JetBrains Mono |

App `PageHeader` stays Inter.

## Landing structure

1. Hero — headline + product
2. Provider logo grid (6 marks, live / gateway / roadmap)
3. Full-bleed product band
4. Platform capabilities (2×2 sharp grid + diagrams)
5. FAQ
6. Ink CTA

## Files

- Tokens: `prototype/src/app/globals.css`
- Copy + SEO: `prototype/src/lib/landing-copy.ts`
- Logos: `prototype/src/components/landing/svg/provider-logos.tsx`
- Page: `prototype/src/components/landing/landing-page-client.tsx`
