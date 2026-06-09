# Covalynce

AI FinOps & Governance platform — understand, control, and govern enterprise AI spending.

**Repository:** [github.com/PracticalAPM/Covalynce](https://github.com/PracticalAPM/Covalynce)

**Start with Community Edition** — free to explore solo or with a team (self-host, no credit card). **Enterprise** is gatekept for SSO, compliance exports, multi-workspace switching, and custom RBAC. Compare at [/editions](http://localhost:3000/editions) or [COMMUNITY_EDITION.md](./COMMUNITY_EDITION.md).

## Deploy to Vercel (frontend)

1. Import this repo on [Vercel](https://vercel.com/new).
2. Set **Root Directory** to `prototype`.
3. Environment variables for a **demo deploy**:
   - `NEXT_PUBLIC_USE_API=false`
   - `NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app`
4. Deploy.

For a **working product** (auth, billing sync, persistence), read **[DEPLOYMENT_READINESS.md](./DEPLOYMENT_READINESS.md)** — you also need the API, Postgres, and Redis hosted separately.

## Project structure

| Directory | Description |
|-----------|-------------|
| [PRODUCT_DEVELOPMENT_ROADMAP.md](./PRODUCT_DEVELOPMENT_ROADMAP.md) | **Start here** — sprint-by-sprint plan & resume guide |
| [QUICKSTART.md](./QUICKSTART.md) | **5-minute setup** — local dev & self-host |
| [DEPLOYMENT_READINESS.md](./DEPLOYMENT_READINESS.md) | **Production checklist** — Vercel + API + integrations |
| [COMMUNITY_EDITION.md](./COMMUNITY_EDITION.md) | Open source vs commercial features |
| [prototype/](./prototype/) | Next.js web app (mock + live API mode) |
| [api/](./api/) | NestJS backend + Prisma |
| `PRD.md`, `VISION_*.md`, … | Strategy & product docs |

## Quick start

See **[QUICKSTART.md](./QUICKSTART.md)** for the full walkthrough. Short version:

```bash
docker compose up -d
cd api && npm install && npx prisma migrate dev && npm run start:dev
cd prototype && cp .env.local.example .env.local  # set NEXT_PUBLIC_USE_API=true
npm run dev
```

- Web: http://localhost:3000
- API docs: http://localhost:3001/docs
- In-app guide: http://localhost:3000/help

## Self-host

```bash
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## Resume after a break

Open [PRODUCT_DEVELOPMENT_ROADMAP.md](./PRODUCT_DEVELOPMENT_ROADMAP.md) → **Progress tracker** → **Next session start here**.
