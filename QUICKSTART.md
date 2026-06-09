# Covalynce — 5-minute quickstart

Get from zero to a live AI spend dashboard in about five minutes.

## Prerequisites

- Docker Desktop (for Postgres + Redis)
- Node.js 20+
- Two terminal windows

## Step 1 — Start infrastructure (1 min)

```bash
docker compose up -d
```

## Step 2 — Start the API (2 min)

```bash
cd api
npm install
cp .env.example .env          # edit secrets if needed
npx prisma migrate dev
npm run db:seed               # optional: pricing tables
npm run start:dev
```

API: http://localhost:3001 · Swagger: http://localhost:3001/docs

## Step 3 — Start the web app (1 min)

```bash
cd prototype
npm install
cp .env.local.example .env.local
```

Set in `.env.local`:

```env
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
npm run dev
```

Web: http://localhost:3000

## Step 4 — Create your org & connect a provider (1 min)

1. Open http://localhost:3000/onboarding
2. Create your organization (name + admin email)
3. Go to **Providers** → **Connect provider**
4. Use demo key `sk-demo-test-key` for any provider — syncs sample usage instantly
5. Open **Dashboard** — you should see spend within seconds

## Self-host (production-like)

```bash
cp .env.prod.example .env.prod   # fill in secrets
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Web: http://localhost:3000 · API: http://localhost:3001

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Dashboard empty after connect | Click **Sync now** on provider card, or wait 15 min for scheduled sync |
| API won't start | Ensure Docker is running; check `DATABASE_URL` in `api/.env` |
| Login fails | Use the org slug from signup; email must match admin email |
| CORS errors | Set `CORS_ORIGIN=http://localhost:3000` in `api/.env` |

## Next steps

- Set **Budgets** and **Alert settings** (Slack webhook optional)
- Invite team members at **Settings → Members**
- Review **Audit log** (admin only)

See [PRODUCT_DEVELOPMENT_ROADMAP.md](./PRODUCT_DEVELOPMENT_ROADMAP.md) for the full product plan.
