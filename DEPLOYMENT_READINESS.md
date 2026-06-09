# Deployment readiness — beyond the prototype

This document lists what you need for Covalynce to **work in production**, not just look good in a demo. The web app can deploy to [Vercel](https://vercel.com) today; the API and data layer require separate infrastructure.

Repository: [github.com/PracticalAPM/Covalynce](https://github.com/PracticalAPM/Covalynce)

---

## Architecture at a glance

| Layer | Directory | Where to host | Required for |
|-------|-----------|---------------|--------------|
| **Web** | `prototype/` | Vercel (recommended) or Docker | UI, marketing, in-app flows |
| **API** | `api/` | Railway, Render, Fly.io, AWS, or Docker | Auth, orgs, billing sync, budgets, gateway |
| **PostgreSQL** | Prisma | Neon, Supabase, RDS, or Docker | All persistent data |
| **Redis** | BullMQ jobs | Upstash, ElastiCache, or Docker | Background sync, alerts, queues |

**Vercel hosts the Next.js frontend only.** NestJS, Postgres, and Redis do not run on Vercel’s default Next.js deployment.

---

## Mode 1 — Vercel demo (works immediately)

What you get: landing page, dashboard tour, mock data, onboarding UI. **No real org persistence or provider billing sync.**

### Vercel project settings

1. Import [PracticalAPM/Covalynce](https://github.com/PracticalAPM/Covalynce) on Vercel.
2. Set **Root Directory** to `prototype`.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables:

| Variable | Value (demo) | Required |
|----------|--------------|----------|
| `NEXT_PUBLIC_USE_API` | `false` | Yes |
| `NEXT_PUBLIC_API_URL` | `https://your-api.example.com` | Optional in demo mode |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | Recommended (OG tags, sitemap) |

5. Deploy. Build command: `npm run build` (see `prototype/vercel.json`).

### What still works in demo mode

- Marketing / landing page
- Dashboard with sample data (`/dashboard`)
- Help center and docs pages
- UI flows for providers, budgets, settings (local/mock state)

### What does **not** work in demo mode

- Creating an org that persists after refresh
- Real login across devices
- Provider billing sync (OpenAI, Anthropic, Gemini)
- Budget alerts, audit logs, gateway proxy
- Enterprise SSO

---

## Mode 2 — Full product (frontend + API)

For a working product, deploy **all** of the following.

### 1. PostgreSQL

- Create a Postgres 16+ instance (Neon, Supabase, RDS, etc.).
- Set `DATABASE_URL` on the API (see `api/.env.example`).
- Run migrations from the API directory:

```bash
cd api
npx prisma migrate deploy
npm run db:seed   # optional: pricing tables
```

### 2. Redis

- Create Redis 7+ (Upstash is a common choice for serverless-friendly setups).
- Set `REDIS_URL` on the API.
- Required for: billing sync jobs, alert delivery, BullMQ queues.

### 3. API (NestJS)

Deploy `api/` to a Node host that supports long-running processes and port binding.

**Minimum environment variables** (`api/.env.example`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Min 32 chars; signs access tokens |
| `CREDENTIALS_ENCRYPTION_KEY` | Min 32 chars; encrypts provider API keys at rest |
| `CORS_ORIGIN` | Your Vercel URL, e.g. `https://covalynce.vercel.app` |
| `PORT` | `3001` or host-assigned port |
| `NODE_ENV` | `production` |
| `API_PREFIX` | `api/v1` (default) |

**Start command:** `npm run build && npm run start:prod`

**Health check:** `GET /api/v1/health` (verify after deploy).

**Optional but important for production:**

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` + `ALERT_FROM_EMAIL` | Email budget alerts |
| `OPENAI_OAUTH_*`, `ANTHROPIC_OAUTH_*`, `GOOGLE_OAUTH_*` | Provider OAuth connect |
| `FRONTEND_URL` | OAuth redirect base |
| `CLERK_*` | If using Clerk auth (Sprint 1 path) |
| `THROTTLE_TTL_MS` / `THROTTLE_LIMIT` | Rate limiting |

### 4. Web (Vercel) — live API mode

Point the frontend at your deployed API:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_USE_API` | `true` |
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` (no trailing slash) |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

Redeploy Vercel after changing `NEXT_PUBLIC_*` variables (they are baked in at build time).

### 5. CORS and cookies

- `CORS_ORIGIN` on the API must **exactly match** the browser origin (scheme + host, no path).
- If you add a custom domain on Vercel, update `CORS_ORIGIN` and redeploy the API.

---

## Provider integrations (real billing data)

Mock/demo keys (`sk-demo-test-key`) work for local development only. For production:

1. Register OAuth apps with OpenAI, Anthropic, and Google (see `INTEGRATIONS_STRATEGY.md`).
2. Set OAuth client IDs/secrets and redirect URIs on the API.
3. Redirect URI must hit your **frontend** callback route:  
   `https://yourdomain.com/providers/oauth/callback`
4. Store provider credentials encrypted via `CREDENTIALS_ENCRYPTION_KEY`.

Without OAuth credentials, users cannot connect live provider billing.

---

## Authentication

| Mode | Config | Use case |
|------|--------|----------|
| Dev passwordless | `AUTH_MODE=dev_passwordless` (default in dev) | Local only |
| Magic link | `AUTH_MODE=magic_link` + email provider | Staging/production |
| SSO | Enterprise + `SSO_MOCK_ENABLED=false` + IdP config | Enterprise edition |

Production checklist:

- [ ] Strong `JWT_SECRET` (rotate from example values)
- [ ] `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` set appropriately
- [ ] HTTPS everywhere (Vercel + API host)

---

## Self-host (full stack in Docker)

For a single-server deployment without Vercel:

```bash
cp .env.prod.example .env.prod
# Edit: POSTGRES_PASSWORD, JWT_SECRET, CREDENTIALS_ENCRYPTION_KEY,
#       NEXT_PUBLIC_API_URL, CORS_ORIGIN
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Runs: Postgres, Redis, API, and web (Next.js standalone). See `docker-compose.prod.yml`.

---

## Pre-launch checklist

### Security

- [ ] All secrets in host env vars, not in git
- [ ] `api/.env` never committed (see root `.gitignore`)
- [ ] `CREDENTIALS_ENCRYPTION_KEY` and `JWT_SECRET` are unique per environment
- [ ] API not publicly exposed without auth except `/health` and documented public routes

### Data

- [ ] `prisma migrate deploy` run on production database
- [ ] Backups configured for Postgres
- [ ] Redis persistence policy understood (jobs can replay on failure)

### Frontend

- [ ] `npm run build` passes in `prototype/` (CI/Vercel)
- [ ] `NEXT_PUBLIC_SITE_URL` set for SEO (sitemap, OG images)
- [ ] Custom domain + SSL on Vercel

### API

- [ ] `npm run build` passes in `api/`
- [ ] Health endpoint returns 200
- [ ] Swagger at `/docs` disabled or protected in production (if desired)
- [ ] `CORS_ORIGIN` matches Vercel URL

### Integrations

- [ ] At least one provider OAuth app configured (or document manual API key flow)
- [ ] Alert email (`RESEND_API_KEY`) or Slack webhooks tested
- [ ] Scheduled billing sync verified (check Redis + worker logs)

### Legal / product

- [ ] Privacy policy and terms linked from app (if public signup)
- [ ] Community vs Enterprise feature gating documented (`COMMUNITY_EDITION.md`)

---

## Recommended deployment paths

| Goal | Web | API + DB |
|------|-----|----------|
| **Investor / design demo** | Vercel, `NEXT_PUBLIC_USE_API=false` | None |
| **Private beta** | Vercel + custom domain | Railway/Render + Neon + Upstash |
| **Self-host / air-gap** | Docker `web` service | Docker compose prod bundle |
| **Enterprise** | Vercel or customer VPC | Customer-managed Postgres/Redis |

---

## Verify locally before shipping

```bash
# Full stack
docker compose up -d
cd api && npm install && cp .env.example .env && npx prisma migrate dev && npm run start:dev
cd prototype && cp .env.local.example .env.local
# Set NEXT_PUBLIC_USE_API=true and NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

Create an org at `/onboarding`, connect a provider with `sk-demo-test-key`, confirm spend on `/dashboard`.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Failed to fetch` on Vercel | API mode on but API down or CORS wrong | Set `NEXT_PUBLIC_USE_API=false` for demo, or fix API + `CORS_ORIGIN` |
| Empty dashboard after connect | Sync job failed | Check Redis, API logs, click **Sync now** |
| OAuth redirect error | Redirect URI mismatch | Match provider console to `FRONTEND_URL/providers/oauth/callback` |
| Build fails on Vercel | Wrong root directory | Root Directory = `prototype` |
| Env var not applied | `NEXT_PUBLIC_*` changed without rebuild | Redeploy Vercel after env changes |

---

## Related docs

- [QUICKSTART.md](./QUICKSTART.md) — local 5-minute setup
- [INTEGRATIONS_STRATEGY.md](./INTEGRATIONS_STRATEGY.md) — provider OAuth
- [COMMUNITY_EDITION.md](./COMMUNITY_EDITION.md) — feature gating
- [PRODUCT_DEVELOPMENT_ROADMAP.md](./PRODUCT_DEVELOPMENT_ROADMAP.md) — sprint status
