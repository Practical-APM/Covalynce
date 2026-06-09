# Covalynce — Product Development Roadmap

**Product:** Covalynce (AI FinOps & Governance)  
**Version:** 1.0  
**Last updated:** June 2026  
**Status:** Active development  

Use this document to resume work after a break. Update the **Progress tracker** at the bottom each time you finish a task.

---

## How to resume

1. Read **Current sprint** and **Progress tracker** below.
2. Run local stack: `docker compose up -d` then `cd api && npm run start:dev` and `cd prototype && npm run dev`.
3. Complete unchecked items in the active sprint before moving on.
4. Every feature must pass: *"Does this help users understand where their AI spend is going?"* (MVP only).

---

## Repository layout

```text
projectX/
├── PRODUCT_DEVELOPMENT_ROADMAP.md   ← you are here
├── PRD.md, VISION_*.md, ...          ← strategy docs
├── docker-compose.yml                ← Postgres + Redis
├── api/                              ← NestJS backend (real product)
├── prototype/                        ← Next.js UI (full clickable prototype)
└── packages/                         ← shared types (future)
    └── shared/
```

| Path | Purpose |
|------|---------|
| `prototype/` | Full UI prototype — all MVP screens, mock data, demo flows |
| `api/` | Production API — PostgreSQL, jobs, provider adapters |
| `docker-compose.yml` | Local Postgres 16 + Redis 7 |

**Future (post-MVP):** rename `prototype/` → `apps/web`, add Turborepo, extract `packages/provider-adapters`.

---

## North star & MVP exit criteria

**North star:** % of organizational AI spend tracked through Covalynce.

**MVP success (from PRD):** Customer answers in **60 seconds**:

- How much AI cost us this month?
- Which teams / users / models / providers cost the most?
- Which projects consume the most resources?

**MVP technical:** Dashboard &lt; 3s, usage queries &lt; 2s, API &lt; 500ms p95.

**MVP business:** 5 design partners, 10 active orgs, 100 connected provider accounts.

---

## Phase overview

| Phase | Timeline | Theme | Outcome |
|-------|----------|-------|---------|
| **Sprint 0** | Week 0 | Foundation | Monorepo layout, Docker, roadmap, full prototype |
| **Sprint 1** | Weeks 1–2 | Identity | Auth, orgs, users, teams, RBAC |
| **Sprint 2** | Weeks 3–4 | Ingestion | Provider adapters, usage sync, events |
| **Sprint 3** | Weeks 5–6 | Analytics | Dashboard API, aggregations, team analytics |
| **Sprint 4** | Weeks 7–8 | Control | Budgets, alerts, email/Slack |
| **Sprint 5** | Weeks 9–10 | Hardening | Security, audit logs, encryption, docs |
| **Sprint 6** | Weeks 11–12 | Beta | Design partners, polish, self-host packaging |
| **v2** | Months 6–12 | Optimization | Model routing, recommendations |
| **v3** | Months 12–18 | Governance | Policy engine, compliance |
| **v4+** | 18+ mo | Platform | Gateway, agent governance, AI OS |

---

## Sprint 0 — Foundation (Week 0)

**Goal:** Anyone can clone, run UI + DB, and navigate a complete prototype.

### Deliverables

- [x] `PRODUCT_DEVELOPMENT_ROADMAP.md` (this file)
- [x] `docker-compose.yml` (Postgres + Redis)
- [x] `api/` NestJS scaffold + Prisma schema + health check
- [x] Full prototype (all screens below)

### Prototype — complete screen list

| Screen | Route | Status |
|--------|-------|--------|
| Landing | `/` | Done |
| Login | `/login` | Done |
| Sign up | `/signup` | Done |
| Onboarding | `/onboarding` | Done |
| Dashboard | `/dashboard` | Done |
| Providers | `/providers` | Done |
| Provider detail | `/providers/[id]` | Done |
| Teams | `/teams` | Done |
| Team detail | `/teams/[id]` | Done |
| Users | `/users` | Done |
| User detail | `/users/[id]` | Done |
| Models | `/models` | Done |
| Usage explorer | `/usage` | Done |
| Budgets | `/budgets` | Done |
| Alerts | `/alerts` | Done |
| Alert settings | `/alerts/settings` | Done |
| Settings — General | `/settings` | Done |
| Settings — Members | `/settings/members` | Done |
| Settings — Billing | `/settings/billing` | Done |
| Reports | `/reports` | Done |
| Audit log | `/settings/audit` | Done |

### Backend — Sprint 0

- [x] NestJS app bootstrap
- [x] Prisma + initial schema (organizations, users, teams, providers, usage_events, budgets, alerts, pricing_versions, audit_logs)
- [x] `GET /health`, `GET /api/v1/health`
- [x] `POST /api/v1/organizations`, `GET /api/v1/organizations/:id`
- [x] `GET/POST /api/v1/teams`
- [x] `GET /api/v1/dashboard` + demo seed endpoint
- [x] README in `api/` with setup steps
- [ ] Run `prisma migrate dev` (requires Docker Postgres)

---

## Sprint 1 — Identity & tenancy (Weeks 1–2)

**Goal:** Real multi-tenant orgs with users and roles.

### Backend

- [ ] Clerk or Auth0 integration (JWT validation middleware) — JWT dev auth done; Clerk optional next
- [x] `POST /api/v1/organizations` — create org (+ returns JWT)
- [x] `GET /api/v1/organizations/:id` (auth + org scope)
- [x] `POST /api/v1/organizations/:id/invites` — invite user
- [x] `POST /api/v1/auth/login`
- [x] `GET /api/v1/users/me`
- [x] `GET /api/v1/users` (list members)
- [x] `PATCH /api/v1/users/:id` — role assignment (admin only)
- [x] `CRUD /api/v1/teams` (auth scoped)
- [x] `GET /api/v1/audit-logs` (admin)
- [x] `organization_id` scoping on protected routes
- [x] Audit log entries for org/user/team changes
- [x] Unit tests for tenancy isolation

### Frontend (wire to API)

- [x] API client (`prototype/src/lib/api.ts`)
- [x] Auth provider + session storage + API gate
- [x] Settings & members pages use live API (when flag on)
- [x] Onboarding creates real org (when `NEXT_PUBLIC_USE_API=true`)

### Prototype

- [x] Org name from session when API connected (`NEXT_PUBLIC_USE_API`)

### Definition of done

- New user can sign up, create org, invite member, assign role, create team.
- Two orgs cannot see each other's data (tested).

---

## Sprint 2 — Provider ingestion (Weeks 3–4)

**Goal:** Pull usage from OpenAI, Anthropic, Gemini into canonical events.

### Backend

- [x] `api/src/providers/` adapter interface + OpenAI / Anthropic / Gemini adapters
- [x] `POST /api/v1/providers/connect` — AES-256-GCM encrypted credentials
- [x] `GET /api/v1/providers`, `GET /api/v1/providers/:id`
- [x] `DELETE /api/v1/providers/:id`
- [x] `POST /api/v1/providers/:id/sync` — manual sync
- [x] BullMQ job: `provider-sync` every 15 minutes
- [x] Cost calculation engine + `pricing_versions` seed (`npm run db:seed`)
- [x] Immutable append-only `usage_events` (skip duplicates)
- [x] `GET /api/v1/usage` with filters (date, provider, team, user, model)

### Frontend

- [x] Providers page: connect, sync status, sync now (API mode)
- [x] Usage explorer: live API data when `NEXT_PUBLIC_USE_API=true`

### Definition of done

- Connected OpenAI key ingests events within 15 min sync.
- Costs computed using pricing table for test models.

---

## Sprint 3 — Analytics & dashboard (Weeks 5–6)

**Goal:** Sub-3s dashboard answering the MVP questions.

### Backend

- [x] Analytics service + `daily_spend_snapshots` rollup table
- [x] Redis cache for dashboard payloads (TTL 5 min)
- [x] `GET /api/v1/dashboard?range=` — executive summary
- [x] `GET /api/v1/analytics/providers|teams|users|models`
- [x] Background job: daily aggregation (BullMQ, 24h)
- [ ] Load test: 1M events, dashboard &lt; 3s

### Frontend

- [x] Dashboard consumes `/dashboard` API with date range
- [x] Models page uses `/analytics/models`
- [ ] Team & user detail pages with real data (Sprint 3 partial)

### Definition of done

- CTO opens dashboard → sees MTD spend, top team, top provider in one view &lt; 3s.

---

## Sprint 4 — Budgets & alerts (Weeks 7–8)

**Goal:** Monitoring-only budgets + proactive alerts (enforcement in v2).

### Backend

- [x] `CRUD /api/v1/budgets` (org + team scope, monthly limit)
- [x] BullMQ: `alert-evaluation` every 5 minutes (budget + spike checks)
- [x] Alert types: budget_threshold, spend_spike, provider_spike
- [x] `GET /api/v1/alerts`, `PATCH` mark read
- [x] Email notifications (Resend when `RESEND_API_KEY` set; logs in dev)
- [x] Slack webhook integration
- [x] `PATCH /api/v1/alerts/settings`

### Frontend

- [x] Budget create dialog
- [x] Alerts settings page (threshold, Slack, email)
- [x] Slack test connection UI

### Definition of done

- Team at 95% budget triggers in-app + Slack alert within 5 minutes.

---

## Sprint 5 — Security & enterprise prep (Weeks 9–10)

**Goal:** Design partners can self-host with confidence.

### Backend

- [x] Encryption at rest for provider credentials (AES-256-GCM, Sprint 2)
- [x] Rate limiting (per org via `OrgThrottlerGuard`, configurable TTL/limit)
- [x] Structured audit logs (config changes + actor enrichment)
- [x] `GET /api/v1/audit-logs` (admin only)
- [x] OpenAPI / Swagger docs with JWT bearer auth
- [x] Input validation (class-validator) on DTOs + global ValidationPipe
- [x] CORS + helmet (JWT auth — CSRF N/A for Bearer tokens)
- [x] Request metrics + `GET /api/v1/health/metrics`

### Frontend

- [x] Audit log page (live API + admin gate)
- [x] Role-gated UI (viewer cannot connect providers / create budgets / invite)

### DevOps

- [x] `Dockerfile` for api + web
- [x] `docker-compose.prod.yml` self-host bundle
- [x] Env templates `.env.example` + `.env.prod.example`

### Definition of done

- Security checklist from PRD signed off; 1 design partner runs Docker Compose on their VPC.

---

## Sprint 6 — Beta release (Weeks 11–12)

**Goal:** 5 design partners on production-like environment.

### Product

- [x] Onboarding docs + 5-minute quickstart (`QUICKSTART.md`, `/help`)
- [x] In-app “Sync health” status (`GET /providers/sync-health`, dashboard banner)
- [x] Empty states for new orgs (dashboard, providers, usage, models)
- [x] Error states + retry for failed syncs (providers page)
- [x] Product analytics events (`POST /api/v1/events`, PRD list)

### GTM (parallel)

- [x] Discovery / design partner tracker template (`docs/DESIGN_PARTNER_TRACKER.md`)
- [ ] 30 discovery interviews tracked in spreadsheet
- [ ] 5 design partner agreements
- [x] Landing page copy aligned with positioning

### Open source (Community edition)

- [x] Community vs commercial documented (`COMMUNITY_EDITION.md`)
- [ ] Public repo subset: core API + dashboard + 1 provider
- [ ] Apache 2.0 license on community features
- [x] Commercial feature flags documented

### Definition of done

- 5 design partners active; weekly admin WAU &gt; 60% for pilot cohort.

---

## Post-MVP roadmap (high level)

### v2 — Control & optimization (months 6–12)

- [x] Hard spend caps (block at gateway — OpenAI proxy + `HARD_CAP` mode)
- [ ] Model routing recommendations (auto-apply)
- [x] Cost optimization insights (rule-based)
- [ ] Anomaly detection ML

### v3 — Governance (months 12–18)

- [x] Policy engine (model allow/deny + budget rules)
- [x] Model allow/deny lists
- [ ] Policy YAML import
- [ ] Compliance exports (SOC2-friendly)
- [ ] SSO + advanced RBAC (commercial)

### v4 — Gateway (months 18–24)

- [x] Covalynce AI Gateway (OpenAI-compatible, Phase 7)
- [x] Real-time budget enforcement at gateway
- [ ] Multi-provider gateway
- [ ] Intelligent routing

### v5 — AI operating layer (24+ mo)

- Agent registry & budgeting
- AI procurement / license management
- Spend → revenue attribution graph

---

## API surface (MVP target)

| Method | Path | Sprint |
|--------|------|--------|
| GET | `/health` | 0 |
| POST | `/api/v1/organizations` | 1 |
| GET | `/api/v1/organizations/:id` | 1 |
| POST | `/api/v1/organizations/:id/invites` | 1 |
| GET | `/api/v1/users/me` | 1 |
| CRUD | `/api/v1/teams` | 1 |
| POST | `/api/v1/providers/connect` | 2 |
| GET | `/api/v1/providers` | 2 |
| GET | `/api/v1/usage` | 2 |
| GET | `/api/v1/dashboard` | 3 |
| GET | `/api/v1/analytics/*` | 3 |
| CRUD | `/api/v1/budgets` | 4 |
| GET/PATCH | `/api/v1/alerts` | 4 |
| GET | `/api/v1/audit-logs` | 5 |

---

## Database tables (Prisma)

Aligned with PRD + tech architecture:

- `organizations`, `users`, `teams`, `team_members`
- `providers` (encrypted credentials)
- `usage_events` (immutable)
- `pricing_versions`
- `budgets`, `alerts`, `alert_settings`
- `audit_logs`
- Future: `projects`, `cost_centers`, `policy_rules`

---

## Tech stack (locked for MVP)

| Layer | Choice |
|-------|--------|
| Web | Next.js 16, TypeScript, Tailwind, shadcn |
| API | NestJS 11, TypeScript |
| ORM | Prisma |
| DB | PostgreSQL 16 |
| Queue | BullMQ + Redis |
| Auth | Clerk (primary) or Auth0 |
| Hosting target | AWS (ECS/RDS later); Docker Compose locally |

---

## Progress tracker

Update this table when you complete work.

| Sprint | Status | Notes |
|--------|--------|-------|
| Sprint 0 | **Complete** (migrate pending Docker) | Roadmap, full prototype, API scaffold |
| Sprint 1 | **Complete** | JWT auth, invites, teams CRUD, UI wire |
| Sprint 2 | **Complete** | Provider adapters, sync, usage API, cost engine |
| Sprint 3 | **Complete** | Analytics, Redis cache, live dashboard |
| Sprint 4 | **Complete** | Budgets CRUD, alert engine, Slack/email, UI wire |
| Sprint 5 | **Complete** | Rate limits, helmet, metrics, Docker prod, RBAC UI |
| Sprint 6 | **Complete** | Beta polish, empty states, sync health, analytics |
| Post-MVP Phase 7 | **Complete** | Gateway proxy, policies, insights |
| Post-MVP Phase 7b | **Complete** | Anthropic/Gemini, streaming, rate limits, insight apply |
| Post-MVP Phase 8 | **Complete** | Anomalies, what-if simulator, RPM edit, Gemini streaming |
| Post-MVP Phase 9 | **Complete** | YAML policy import/export, compliance CSV bundle |
| Post-MVP Phase 10 | **Complete** | Unified routing, agents, licenses, intelligent routing |
| Post-MVP Phase 11 | **Complete** | SSO (Clerk/Auth0), advanced RBAC |

**Last session focus:** Critical gap review — see [GAPS_AND_REMEDIATION_SPRINTS.md](./GAPS_AND_REMEDIATION_SPRINTS.md).

**Next session start here:**

1. **Sprint 12:** Wire Teams/Users/detail pages to API; session expiry handling
2. **Sprint 13:** Onboarding + seed demo button
3. Full gap list and sprint plan: [GAPS_AND_REMEDIATION_SPRINTS.md](./GAPS_AND_REMEDIATION_SPRINTS.md)

---

## Reference documents

- `PRD.md` — MVP features & acceptance
- `VISION_AND_PRODUCT_STRATEGY.md` — phases 1–5
- `TECH_ARCHITECTURE_AND_OPEN_SOURCE_STRATEGY.md` — services, events, open core
- `CUSTOMER_DISCOVERY_AND_GTM.md` — validation & design partners
- `COMPETITIVE_MOAT_ANALYSIS.md` — why gateway matters
- `POST_MVP_ROADMAP.md` — Phase 7+ execution tracker

---

## Canonical usage event (all providers map to this)

```json
{
  "event_id": "uuid",
  "provider": "openai",
  "model": "gpt-4o",
  "organization_id": "uuid",
  "user_id": "uuid",
  "team_id": "uuid",
  "input_tokens": 1200,
  "output_tokens": 400,
  "cost": 0.042,
  "timestamp": "2026-06-03T12:00:00Z"
}
```

---

*This roadmap is the single source of truth for engineering execution. Strategy docs define **why**; this doc defines **what, when, and done**.*
