# Post-MVP Roadmap — Covalynce

**Status:** Complete (Phases 7–11)  
**Last updated:** June 2026

This document tracks work after the MVP sprints (0–6). The strategic goal is to move from **visibility** → **control** → **gateway moat**.

---

## Phase 7 — Gateway foundation ✅

**Goal:** Every LLM request *can* flow through Covalynce for tracking + enforcement.

| Item | Status | Notes |
|------|--------|-------|
| Gateway API keys (`gateway_api_keys`) | Done | `POST/GET/DELETE /api/v1/gateway/keys` |
| OpenAI-compatible proxy | Done | `POST /api/v1/gateway/v1/chat/completions` |
| Real-time usage recording | Done | Events on each completion |
| Policy engine (allow/deny/hard cap) | Done | `PolicyEngineService` |
| Org budget enforcement mode | Done | `MONITORING` \| `HARD_CAP` on org |
| Policy CRUD API | Done | `/api/v1/policies` |
| Gateway UI | Done | `/gateway` |
| Policies UI | Done | `/policies` |

---

## Phase 7b — Multi-provider gateway ✅

| Item | Status | Notes |
|------|--------|-------|
| Anthropic Messages proxy | Done | `POST /api/v1/gateway/anthropic/v1/messages` |
| Gemini generate proxy | Done | `POST /api/v1/gateway/gemini/v1/generate` |
| SSE streaming (OpenAI + Anthropic) | Done | `stream: true` passthrough |
| Per-key rate limits | Done | Redis RPM via `rateLimitRpm` on keys |
| Insight auto-apply (deny policy) | Done | `POST /api/v1/insights/optimization/:id/apply` |
| Gateway UI (multi-provider docs) | Done | Snippets + streaming note |
| Insights UI (Apply policy button) | Done | Admin one-click deny |

### Try the gateway

```bash
# 1. Migrate (includes rateLimitRpm on gateway keys)
cd api && npx prisma migrate dev --name post_mvp

# 2. Create key in UI at /gateway (or API)

# 3. OpenAI (SDK compatible, streaming supported)
curl -X POST http://localhost:3001/api/v1/gateway/v1/chat/completions \
  -H "Authorization: Bearer gk_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"hi"}]}'

# 4. Anthropic
curl -X POST http://localhost:3001/api/v1/gateway/anthropic/v1/messages \
  -H "Authorization: Bearer gk_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-haiku","max_tokens":256,"messages":[{"role":"user","content":"hi"}]}'

# 5. Gemini
curl -X POST http://localhost:3001/api/v1/gateway/gemini/v1/generate \
  -H "Authorization: Bearer gk_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-2.0-flash","contents":[{"parts":[{"text":"hi"}]}]}'
```

---

## Phase 8 — Optimization (v2) ✅

| Item | Status | Notes |
|------|--------|-------|
| Optimization insights API | Done | `/api/v1/insights/optimization` |
| Insights UI | Done | `/insights` |
| Model routing recommendations (auto) | Done | One-click deny policy from `/insights` |
| Anomaly detection (statistical) | Done | Z-score on daily/model/user spend — `/api/v1/insights/anomalies` |
| What-if cost simulator | Done | `POST /api/v1/insights/simulate` + dashboard widget |
| Gateway RPM edit UI | Done | `PATCH /api/v1/gateway/keys/:id` |
| Gemini streaming | Done | `stream: true` on Gemini generate route |

---

## Phase 9 — Governance (v3) ✅

| Item | Status | Notes |
|------|--------|-------|
| Policy rules (JSON) | Done | CRUD at `/api/v1/policies` |
| YAML policy import/export | Done | `POST /import/yaml`, `GET /export/yaml` |
| Team-scoped policies | Done | Schema supports `teamId` + `team` name in YAML |
| Compliance export (CSV) | Done | `GET /api/v1/compliance/export` — audit, usage, policies |
| SSO (Clerk/Auth0) | Done | OIDC JWT exchange + JWKS validation |
| Advanced RBAC | Done | Per-resource permission matrix + overrides |

---

## Phase 11 — Enterprise auth ✅

| Item | Status | Notes |
|------|--------|-------|
| SSO config API | Done | `GET/PATCH /api/v1/auth/sso/config` |
| SSO token exchange | Done | `POST /api/v1/auth/sso/exchange` |
| SSO public status | Done | `GET /api/v1/auth/sso/status/:slug` |
| Mock SSO (dev) | Done | `SSO_MOCK_ENABLED=true`, token `mock-sso:email` |
| RBAC permission matrix | Done | `GET /api/v1/rbac/permissions` |
| RBAC overrides | Done | `PATCH /api/v1/rbac/permissions` |
| Audit/compliance gating | Done | `@RequirePermission` on audit + export |
| Settings UI | Done | `/settings/sso`, `/settings/permissions` |

---

## Phase 10 — Platform (v4+) ✅

| Item | Status | Notes |
|------|--------|-------|
| Multi-provider gateway routing | Done | `POST /api/v1/gateway/v1/route/completions` |
| Intelligent model routing | Done | Auto-downgrade via org routing settings |
| Agent registry & budgets | Done | `/api/v1/agents`, `X-Covalynce-Agent-Id` header |
| AI procurement / license mgmt | Done | `/api/v1/licenses` CRUD |

---

## Migration required

After pulling Phase 7 code:

```bash
cd api && npx prisma migrate dev --name post_mvp
```

New schema: `gateway_api_keys` (incl. `rateLimitRpm`), `policy_rules`, `organizations.budget_enforcement`.

```bash
cd api && npx prisma migrate dev --name phase_10_platform
```

New schema: `organization_sso_configs`, `role_permission_overrides`.

```bash
cd api && npx prisma migrate dev --name enterprise_auth
```

---

## Architecture

```text
Application (any model name)
        ↓  /api/v1/gateway/v1/route/completions
Covalynce Gateway (provider inference + intelligent routing)
        ↓  PolicyEngine + agent budgets
        ↓  Usage recording (per agent)
OpenAI / Anthropic / Gemini
```

This is the path to the elite moat described in `COMPETITIVE_MOAT_ANALYSIS.md`.

---

## Post-roadmap: remediation

Feature phases 7–11 are implemented, but a [critical gap review](./GAPS_AND_REMEDIATION_SPRINTS.md) found trust-breaking UX issues (mock data in API mode, dead buttons, synthetic provider sync). **Sprints 12–17** address these before design-partner demos.
