# Critical Gap Review & Remediation Sprints

**Date:** June 2026  
**Context:** Post-MVP Phases 7–11 are feature-complete on paper, but a basic user running `NEXT_PUBLIC_USE_API=true` will hit broken flows, mock data mixed with live data, and buttons that do nothing. This document captures those gaps and plans sprints to fix them.

**Review method:** Code walkthrough of `prototype/` and `api/`, cross-checked against PRD success criteria (“answer spend questions in 60 seconds”) and QUICKSTART onboarding path.

---

## Executive summary (June 2026 — revised)

Sprints 12–15 fixed the worst UX lies: API mode pages are wired, CRUD works, onboarding can connect providers, errors surface in toasts. **That does not mean the product is production-ready.**

What we actually have:

| Layer | Reality |
|-------|---------|
| **UI surface** | Wide — dashboard, gateway, policies, SSO, RBAC, insights, licenses |
| **Core value prop** | Weak — “see my real OpenAI bill” was **fake for every real key** until Sprint 17 started |
| **Auth** | Email + org slug, no password. Anyone who knows both gets in. SSO exists but needs IdP setup |
| **OAuth** | Scaffolding + mock mode. Real vendor OAuth apps not configured by default |
| **Gateway** | Works for proxying; live completions need real upstream keys |
| **Enterprise** | RBAC matrix on client; most API routes still use coarse `@Roles(ADMIN)` |
| **Ops** | Health now checks DB + Redis + workers (Sprint 17). No staging, no monitoring |

**The honest pitch today:** “FinOps dashboard with demo data and a working Gateway prototype.” Not yet: “Connect OpenAI and see your bill.”

---

## What we fixed (Sprints 12–15)

- Teams/Users/Settings wired in API mode
- Session expiry → login redirect
- Onboarding: seed demo, OAuth/API connect, invites
- Budget/member/provider/policy CRUD
- Toasts, skeletons, CSV export, RBAC client gating, live alert badge

## What was still broken (before Sprint 17 work)

1. **Real API keys still got fake `user@acme.com` events** — the #1 trust killer
2. **No SAMPLE vs LIVE labeling** — users couldn't tell demo from production
3. **Anthropic/Gemini live sync** — not implemented (now fails honestly instead of faking)
4. **Auth is not secure** — passwordless email lookup is fine for local dev, not for customers
5. **Real OAuth** — needs vendor app registration; mock is the default path
6. **Pagination** — usage/audit capped at 100–500 rows
7. **Email invites & alert delivery** — silent without Resend
8. **RBAC not enforced on most write APIs** — permission matrix is mostly cosmetic server-side

---

## Gap inventory (by severity)

### Critical — breaks trust or blocks core jobs

| # | Gap | Why it matters | Evidence |
|---|-----|----------------|----------|
| C1 | **Teams & Users pages are mock-only in API mode** | PRD requires team/user attribution; nav promises it | `teams/page.tsx`, `users/page.tsx` import only `mock-data` |
| C2 | **Detail pages 404 or show wrong data** | Clicking a live provider/team/user hits mock `[id]` routes | `providers/[id]`, `teams/[id]`, `users/[id]` |
| C3 | **Provider sync never ingests real usage** | User connects real key; still gets fake `user@acme.com` events | `provider-adapters.ts` L53–61 always returns `demoEvents` |
| C4 | **No session expiry / 401 handling** | Expired JWT → cryptic errors; user stuck in broken UI | `prototype/src/lib/api.ts` — no 401 redirect |
| C5 | **`/signup` is a decorative form** | Collects password; does nothing; misleads users | `signup/page.tsx` — no submit handler |
| C6 | **Mobile layout unusable** | Fixed 256px sidebar; no hamburger | `app-shell.tsx` |

### High — expected basics missing

| # | Gap | Why it matters | Evidence |
|---|-----|----------------|----------|
| H1 | **Budgets: create only, no edit/delete** | API has PATCH/DELETE; UI doesn't | `api.updateBudget` / `api.deleteBudget` unused |
| H2 | **Members: invite only, no role change or remove** | Settings copy implies role management | `settings/members/page.tsx`; API `PATCH users/:id` unused |
| H3 | **Providers: no disconnect in UI** | Can't rotate keys or remove bad connections | `api.deleteProvider` unused |
| H4 | **Policies/agents/licenses: no edit** | Must delete and recreate | PATCH endpoints exist, UI missing |
| H5 | **Non-functional primary buttons** | User clicks; nothing happens | Export CSV (`usage`), Save org (`settings`), Create team, Generate report |
| H6 | **Onboarding doesn't connect providers** | Step 2 toggles local state only | `onboarding/page.tsx` |
| H7 | **No demo seed in UI** | Empty org stays empty until manual provider dance | `POST /dashboard/seed-demo` exists, not wired |
| H8 | **Invite has no role picker** | API accepts `role`; UI always invites as VIEWER | `settings/members/page.tsx` |
| H9 | **Settings & billing pages mock-only** | Org name/plan can't be viewed accurately | `settings/page.tsx`, `settings/billing/page.tsx` |
| H10 | **RBAC matrix ignored by most UI** | Client uses hardcoded `permissions.ts`; overrides don't apply | `myPermissions()` never called |
| H11 | **Alert nav badge hardcoded to 2** | Misleading notification affordance | `app-shell.tsx` |
| H12 | **API errors swallowed** | `load().catch(console.error)` on most pages | Dashboard, teams, etc. |
| H13 | **Login is email + slug only** | No password verification; anyone who knows email+slug gets in | `auth.service.ts` |
| H14 | **Email/Slack alerts often don't send** | Resend key required; failures silent to user | `notifications.service.ts` |

### Medium — polish & scale

| # | Gap | Why it matters |
|---|-----|----------------|
| M1 | Usage date range selector not wired in API mode |
| M2 | No pagination on usage, audit, alerts (hard caps at 100–500) |
| M3 | No search/filter by user email or model on usage |
| M4 | Getting Started checklist never auto-completes |
| M5 | Mock mode vs API mode not explained (banner shows env var names) |
| M6 | Reports page is entirely stubbed — should work or be hidden |
| M7 | Team-scoped policies not exposed in policies UI |
| M8 | Gateway attribution headers undocumented in help |
| M9 | Help sidebar hidden on mobile/tablet |
| M10 | Stale e2e test (`Hello World`) |
| M11 | Health check doesn't cover Redis/workers |
| M12 | `refreshMe()` never called on app boot |

### Low — nice to have

| # | Gap |
|---|-----|
| L1 | SSO presets endpoint not used in settings UI |
| L2 | License summary API unused on licenses page |
| L3 | Product events logged but not queryable |
| L4 | Dashboard team budget progress hidden in API mode |
| L5 | Azure/Bedrock in schema but no adapters |

---

## What works well (don't regress)

- Dashboard + provider connect + sync health in API mode
- Budget create, alert list/mark-read, alert settings
- Gateway key lifecycle, policy YAML import/export, compliance export
- Insights, anomalies, what-if simulator (when data exists)
- In-app help/docs structure
- Empty states on several key pages
- RBAC/SSO settings pages (admin, API mode)

---

## Remediation sprints

These follow MVP Sprints 0–6 and Post-MVP Phases 7–11. Goal: **a basic user can onboard, trust the numbers, and complete everyday tasks without hitting dead ends.**

---

### Sprint 12 — Make API mode honest (2 weeks) ✅

**Theme:** One source of truth. If `NEXT_PUBLIC_USE_API=true`, no page shows Acme mock data.

| Item | Priority | Deliverable |
|------|----------|-------------|
| Wire Teams page | C1 | `GET /analytics/teams` + budgets; replace `mock-data` |
| Wire Users page | C1 | `GET /analytics/users` |
| Wire provider detail | C2 | `GET /providers/:id` or analytics breakdown by provider |
| Wire team/user detail | C2 | Team members + spend from API; user profile from API |
| Wire Settings general | H9 | Show org from session; save name/slug if API added |
| Wire Settings billing | H9 | Show `organization.plan` from API (read-only OK) |
| Session expiry UX | C4 | On 401: clear token, toast, redirect `/login` |
| Remove or fix signup | C5 | Redirect `/signup` → `/onboarding` OR implement real flow |

**Acceptance criteria:**
- [x] With API mode on, Teams/Users/Settings show the same org as Dashboard
- [x] Clicking a team or user from a live list opens a real detail page
- [x] Expired token shows “Session expired” and login screen
- [x] No password field on a non-functional signup page

---

### Sprint 13 — Onboarding & first value (1–2 weeks) ✅

**Theme:** New user sees meaningful data within 5 minutes (QUICKSTART promise).

| Item | Priority | Deliverable |
|------|----------|-------------|
| Seed demo button | H7 | Dashboard or onboarding: “Load sample data” → `POST /dashboard/seed-demo` |
| Onboarding provider step | H6 | Step 2 calls `api.connectProvider` + sync for selected providers |
| Onboarding invite step | H6 | Step 3 calls `api.inviteUser` or skip with clear copy |
| Post-org-create redirect | — | After create org → dashboard or step 2 with success toast |
| Prototype banner copy | M5 | User-friendly: “Demo data” vs “Live data” (hide env var names) |
| Getting Started panel | M4 | Call `markStepComplete` when provider connected / budget set |

**Acceptance criteria:**
- [x] Fresh org can load sample spend in one click
- [x] Onboarding can connect demo provider without visiting Providers page
- [x] User lands on dashboard with clear next step after signup

---

### Sprint 14 — Complete basic CRUD (2 weeks) ✅

**Theme:** Users can fix mistakes without delete-and-recreate.

| Item | Priority | Deliverable |
|------|----------|-------------|
| Budget edit/delete | H1 | Inline edit monthly limit; delete with confirm |
| Member role change | H2 | Role dropdown per member → `PATCH /users/:id` |
| Member remove | H2 | `DELETE /users/:id` (API + UI) |
| Invite role picker | H8 | Admin/Manager/Viewer on invite dialog |
| Provider disconnect | H3 | Disconnect button on provider card/detail |
| Policy edit | H4 | Toggle enabled; edit model list |
| Agent edit | H4 | Edit budget, description, enabled |
| License edit | H4 | Edit seats, cost, renewal date |
| Team create (basic) | H5 | `POST /teams` dialog or remove “Create team” button |

**Acceptance criteria:**
- [x] Admin can change a member from Viewer → Manager
- [x] Admin can delete a budget they created by mistake
- [x] Admin can disconnect a provider
- [x] Every destructive action has confirmation dialog

---

### Sprint 15 — UX fundamentals (1–2 weeks) ✅

**Theme:** Buttons do what they say; errors are visible.

| Item | Priority | Deliverable |
|------|----------|-------------|
| Global error toast | H12 | Shared `useApiError` or toast on fetch failure |
| Loading skeletons | — | Dashboard, tables (usage, teams, users) |
| Live alert badge | H11 | Fetch unread count for nav badge |
| Usage export CSV | H5 | Client-side CSV from loaded rows OR `GET /usage/export` |
| Usage date range | M1 | Wire `DateRangeSelect` to API `from`/`to` |
| Usage team filter | — | Show team filter in API mode |
| Reports page | M6 | Hide “Generate” until implemented OR wire to compliance export |
| RBAC-aware UI | H10 | Load `GET /rbac/me` on login; gate UI from permissions |
| Call `refreshMe` on boot | M12 | Validate session when app loads |

**Acceptance criteria:**
- [x] Failed API call shows user-visible error (not only console)
- [x] Alert badge matches unread count
- [x] Export CSV downloads a file with visible usage rows
- [x] Manager without `budgets:manage` doesn't see budget create button

---

### Sprint 16 — Mobile & responsive (1 week) — mostly done

**Theme:** Usable on laptop and tablet, not only wide desktop.

| Item | Priority | Deliverable | Status |
|------|----------|-------------|--------|
| Collapsible sidebar | C6 | Hamburger + sheet on `< md` | ✅ `app-shell.tsx` |
| Help docs mobile nav | M9 | Section picker on `< lg` | ✅ `docs-shell.tsx` |
| Table horizontal scroll | — | overflow-x on tables | ✅ shadcn Table |
| Settings nav on mobile | — | Horizontal scroll or compact tabs | ⚠️ verify manually |

**Acceptance criteria:**
- [x] Dashboard usable at 375px width (sidebar collapses)
- [ ] Full QA pass on phone for all settings sub-pages

---

### Sprint 17 — Real data & production credibility (2–3 weeks) ✅

**Theme:** Stop lying about data. Be honest when we can't sync yet.

| Item | Priority | Deliverable | Status |
|------|----------|-------------|--------|
| Real OpenAI usage sync | C3 | Organization Usage API | ✅ |
| Stop faking live keys | C3 | Anthropic/Gemini fail honestly, not fake events | ✅ |
| Demo vs live labeling | — | `dataSource: SAMPLE \| LIVE` + UI badges | ✅ |
| Health: Redis/workers | M11 | `/api/v1/health` checks redis + queue | ✅ |
| Fix e2e tests | M10 | Health endpoint tests | ✅ |
| Real Anthropic sync | C3 | Admin Usage API (`/usage_report/messages`) | ✅ |
| Real Gemini sync | C3 | OAuth billing verify + honest BigQuery message | ✅ (limited) |
| OAuth token refresh | — | Refresh before sync when expired | ✅ |
| Invite email (optional) | H14 | Send via Resend when configured | ✅ |
| Pagination | M2 | Cursor on usage + audit logs | ✅ |
| Auth hardening | H13 | Threat model documented | ✅ `AUTH_THREAT_MODEL.md` |
| Enforce RBAC on API | — | `@RequirePermission` on providers, budgets, gateway, policies | ✅ |

**Acceptance criteria:**
- [x] Real OpenAI admin key syncs from Usage API (or clear permission error)
- [x] Demo/mock credentials labeled **Sample data** in UI
- [x] Live Anthropic admin key syncs; non-admin keys get clear error
- [x] Gemini live connect verifies OAuth but explains BigQuery requirement
- [x] Health reports redis + worker queue status
- [x] Audit log paginated beyond 100 rows (`Load more` in UI)
- [x] Invite sends email when `RESEND_API_KEY` set; logs demo mode otherwise

**Known limits (honest):**
- Gemini token-level sync needs GCP BigQuery billing export (not built)
- OpenAI user attribution maps vendor `user_id`, not org email
- Full password/magic-link auth deferred to Sprint 18

---

### Sprint 18 — Auth & notifications (1–2 weeks) ✅

**Theme:** Safe enough for a design partner, not just localhost.

| Item | Deliverable | Status |
|------|-------------|--------|
| Auth model decision | Magic link (passwordless); `dev_passwordless` for local only | ✅ |
| Magic link flow | Request → email → verify → session | ✅ |
| Session refresh | Short-lived JWT + refresh token in DB | ✅ |
| Invite flow | Email with join link when `RESEND_API_KEY` set; honest “not configured” otherwise | ✅ (from Sprint 17, UI feedback in Sprint 18) |
| Alert delivery status | Last email/Slack attempt + error in alert settings | ✅ |
| SSO production path | Checklist on SSO settings page + boot warnings | ✅ |
| Auth config API | `GET /auth/config` exposes mode to frontend | ✅ |
| Threat model | Updated `AUTH_THREAT_MODEL.md` | ✅ |

**Acceptance criteria:**
- [x] Cannot log in with email alone unless `AUTH_MODE=dev_passwordless`
- [x] Magic link issues JWT + refresh token when Resend configured
- [x] Frontend refreshes access token on 401
- [x] Alert settings show last delivery status
- [x] SSO settings page includes production checklist

**Known limits (honest):**
- Org signup still issues JWT in all modes (bootstrap for first admin)
- No refresh token rotation on each use
- No MFA or IP rate limiting yet

---

### Sprint 19 — Scale & hardening (2 weeks) ✅

**Theme:** Survives a real org with real volume.

| Item | Deliverable | Status |
|------|-------------|--------|
| Usage pagination | Cursor-based `GET /analytics/usage` | ✅ (Sprint 17) |
| Audit pagination | Same pattern | ✅ (Sprint 17) |
| RBAC on all write routes | `@RequirePermission` on agents, alerts, licenses, users, teams, insights, org invites, SSO | ✅ |
| Gateway attribution docs | Help page for `X-Covalynce-*` headers | ✅ |
| Azure/Bedrock adapters | Honest “planned” labeling in marketing + help | ✅ |
| Observability | Request IDs, structured JSON logs, `/api/v1/health/metrics` | ✅ |

**Acceptance criteria:**
- [x] No `@Roles` decorators remain on API controllers (permission matrix is source of truth)
- [x] Gateway attribution headers documented with examples
- [x] Azure/Bedrock marked “Soon” on landing; help explains Gateway workaround
- [x] Every API response includes `X-Request-Id`; logs include `requestId`

---

## Sprint map (timeline view)

```text
Sprint 12–15 ████████████  UX honesty, CRUD, onboarding (done)
Sprint 16     ██████░░░░░░  Mobile shell (mostly done)
Sprint 17     ████████████  Real ingestion & ops (done)
Sprint 18     ████████████  Auth & notifications (done)
Sprint 19     ████████████  Scale & RBAC enforcement (done)
```

**Recommended order:** Sprint 19 before >10 active orgs. Auth (Sprint 18) is ready for design partners with `AUTH_MODE=magic_link` + Resend.

---

## PRD success criteria — current status (honest)

| Question (60-second test) | Status |
|---------------------------|--------|
| How much AI cost us this month? | ✅ Dashboard (with data — demo or real OpenAI admin key) |
| Which teams spend the most? | ✅ Teams page (API mode); attribution depends on data source |
| Which users spend the most? | ✅ Users page (API mode); OpenAI user_id mapping is rough |
| Which models cost the most? | ✅ Models page |
| Which provider costs the most? | ✅ Dashboard + Providers |
| Which projects/agents consume most? | ⚠️ Gateway/agent headers work; provider sync doesn't split by project |

**Verdict:** PRD is **~75% met** for demo/sample data. **~55% met** for OpenAI/Anthropic admin keys. **Gemini live billing** still requires BigQuery export or Gateway attribution.

---

## Out of scope (commercial / later)

- Full Clerk/Auth0 hosted login UI (SSO foundation exists; needs IdP setup)
- Scheduled report delivery
- Azure/Bedrock **native billing sync** (demo + Gateway attribution shipped in Sprint 20)
- Password reset email flow (use magic link re-request instead)

**Started in Sprint 20:** cost centers, multi-org switcher, auth hardening — see [SPRINT_20.md](./SPRINT_20.md)

---

## References

- [PRODUCT_DEVELOPMENT_ROADMAP.md](./PRODUCT_DEVELOPMENT_ROADMAP.md)
- [POST_MVP_ROADMAP.md](./POST_MVP_ROADMAP.md)
- [PRD.md](./PRD.md) — MVP success criteria
- [QUICKSTART.md](./QUICKSTART.md)
