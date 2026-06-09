# Covalynce Prototype

Interactive UI prototype for **Covalynce** — AI FinOps & Governance platform.

This is a front-end-only demo with mock data. It demonstrates the MVP experience defined in the product docs: spend visibility, provider/team/user attribution, budgets, and alerts.

## Run locally

```bash
cd prototype
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Prototype flows

| Route | Purpose |
|-------|---------|
| `/` | Landing page — positioning & CTA |
| `/login`, `/signup` | Auth flows (mock → Clerk in Sprint 1) |
| `/onboarding` | 3-step setup: org → providers → invite |
| `/dashboard` | Executive overview — the "60 second" answer |
| `/usage` | Usage explorer with filters + export |
| `/models` | Model cost breakdown |
| `/providers`, `/providers/[id]` | Provider list & detail |
| `/teams`, `/teams/[id]` | Team spend vs. budget |
| `/users`, `/users/[id]` | User attribution & detail |
| `/budgets` | Budget monitoring & burn rate |
| `/alerts`, `/alerts/settings` | Alerts & notification config |
| `/reports` | Report templates & export |
| `/settings/*` | Org, members, billing, audit log |

## What's mocked

- All spend, usage, and attribution data (`src/lib/mock-data.ts`)
- Provider sync; OAuth connect (preferred) with API key fallback when `NEXT_PUBLIC_USE_API=true`
- Auth and user session

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- Recharts

## Next steps (post-prototype)

1. Customer discovery interviews (30–50)
2. Secure 5 design partners
3. Backend: NestJS + PostgreSQL + provider adapters
4. Real usage collection from OpenAI / Anthropic / Gemini APIs
