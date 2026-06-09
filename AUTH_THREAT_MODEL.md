# Covalynce — Authentication Threat Model

**Status:** Sprint 18 (design-partner ready with configuration)  
**Last updated:** June 2026

---

## Auth modes (`AUTH_MODE`)

| Mode | When | Login |
|------|------|-------|
| `dev_passwordless` | Default in local dev | Email + org slug → JWT (no proof of identity) |
| `magic_link` | Default when `NODE_ENV=production` | One-time link emailed via Resend |
| `sso_required` | Enterprise / self-host with IdP | OIDC only; email login blocked |

Set explicitly in `.env`:

```bash
AUTH_MODE=dev_passwordless   # local only
AUTH_MODE=magic_link         # design partners
AUTH_MODE=sso_required       # production with Clerk/Auth0
```

Boot warnings (`AuthBootstrapService`) log when Resend, JWT secret, or IdP config is missing for the chosen mode.

---

## Current flows (honest)

| Flow | Mechanism | Risk |
|------|-----------|------|
| **Dev passwordless** | Know `email` + org `slug` → JWT | Acceptable on localhost only |
| **Magic link** | Hashed token in DB, single-use, 15m TTL | Secure when Resend delivers to real inbox |
| **Refresh token** | Opaque token in DB, revocable, 7d default | Stolen refresh token = session hijack until revoked |
| **SSO** | OIDC token exchange (Clerk/Auth0/mock) | Secure when IdP is configured; mock mode is dev-only |
| **Org signup** | Creates org + admin JWT | Bootstrap path; not gated by `AUTH_MODE` (intentional for first user) |
| **Gateway** | `gk_…` API keys | Keys are secrets; treat like production credentials |
| **Provider connect** | OAuth or encrypted API keys | Stored encrypted; never returned to client |

---

## JWT & sessions

- Access token: HS256, `JWT_SECRET`, default **15m** (`JWT_ACCESS_EXPIRES_IN`)
- Refresh token: opaque, stored hashed in `RefreshToken` table, default **7d** (`JWT_REFRESH_EXPIRES_IN`)
- **Rotation:** each `POST /auth/refresh` revokes the old token and issues a new one
- Client stores both; API returns new access token on refresh
- Expired access token triggers silent refresh in the prototype; failure redirects to login

---

## Magic link security

- Token generated with `crypto.randomBytes`, stored as SHA-256 hash
- Single use; marked consumed on verify
- Rate limit: auth endpoints throttled (magic link 5/min, login 10/min, refresh 30/min per IP/org)
- Single active token per user (previous links invalidated on new request)
- Requires `RESEND_API_KEY` + `FRONTEND_URL` for delivery

---

## Notifications & invites

- Invite emails sent when `RESEND_API_KEY` is set; UI shows honest “email not configured” otherwise
- Alert delivery status recorded on `AlertSetting` (`lastEmailDelivery*`, `lastSlackDelivery*`)
- Test Slack webhook records delivery attempt in settings UI

---

## Intended use

| Deployment | Recommended config |
|------------|-------------------|
| Local demo | `AUTH_MODE=dev_passwordless`, sample data |
| Design partner | `AUTH_MODE=magic_link`, `RESEND_API_KEY`, strong secrets |
| Production | `AUTH_MODE=sso_required`, real IdP, `SSO_MOCK_ENABLED=false` |

Do not expose the API to the public internet with `dev_passwordless`.

---

## Recommendations for self-hosters

1. Set `AUTH_MODE=magic_link` or `sso_required` before any external access.
2. Use strong `JWT_SECRET` and `CREDENTIALS_ENCRYPTION_KEY` (32+ chars).
3. Enable `RESEND_API_KEY` for magic links, invites, and alert email.
4. Set `FRONTEND_URL` to your public app URL (magic link targets).
5. Rotate gateway keys and provider credentials on schedule.
6. Revoke refresh tokens on member removal (automatic on user delete).

---

## Not yet implemented

- Password / bcrypt login (magic link chosen over passwords for Sprint 18)
- MFA / TOTP
- Per-IP login rate limiting beyond NestJS throttler defaults
