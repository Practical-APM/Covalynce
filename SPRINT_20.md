# Sprint 20 — CI, design-partner hardening & post-MVP foundations

**Theme:** Ship what comes after remediation sprints 12–19.

| Track | Items |
|-------|--------|
| **CI** | Fix Jest E2E (ESM `jose` / `jwks-rsa`) |
| **Design-partner hardening** | Auth rate limits, logout + token revoke, magic-link single-active |
| **Post-MVP: chargeback** | Cost centers CRUD, `projectTag` on usage + gateway header |
| **Post-MVP: multi-org** | List memberships, switch org API + UI |
| **Post-MVP: providers** | Azure OpenAI & Bedrock stub adapters (demo + honest live errors) |

---

## Acceptance criteria

- [x] `npm run test:e2e` passes in `api/` (after Jest ESM fix)
- [x] Magic link / login / refresh endpoints are rate-limited
- [x] `POST /auth/logout` revokes refresh token
- [x] Cost centers manageable at `/settings/cost-centers`
- [x] User with same email in 2 orgs can switch workspace
- [x] `X-Covalynce-Project-Tag` recorded on gateway usage events
- [x] Azure/Bedrock connectable with demo keys; live sync fails honestly

---

## Sprint 20 follow-up (completed)

- [x] Providers UI includes Azure OpenAI & AWS Bedrock
- [x] Chargeback report API + CSV download on Reports page
- [x] Email chargeback report (Resend) with dev CSV fallback
- [x] GitHub Actions CI (api build + e2e, prototype build)
- [x] Clearer Azure/Bedrock live-sync error messages

**Still later:** MFA, native Azure/Bedrock billing adapters, cron scheduled reports
