# Covalynce API

NestJS backend for Covalynce AI FinOps.

## Prerequisites

- Node.js 20+
- Docker (Postgres + Redis)

## Quick start

```bash
# From project root
docker compose up -d

cd api
cp .env.example .env   # if .env missing
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

- API: http://localhost:3001  
- Health: http://localhost:3001/api/v1/health  
- Swagger: http://localhost:3001/docs  

## Auth (Sprint 1)

### Create organization (returns JWT)

```bash
curl -X POST http://localhost:3001/api/v1/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "slug": "acme",
    "adminEmail": "admin@acme.com",
    "adminName": "Sarah Chen"
  }'
```

Save `accessToken` from the response.

### Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","organizationSlug":"acme"}'
```

### Authenticated requests

```bash
export TOKEN="<accessToken>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/users/me
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/dashboard
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/dashboard/seed-demo
```

### Connect provider

```bash
curl -X POST http://localhost:3001/api/v1/providers/connect \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"OPENAI","apiKey":"sk-demo-test-key"}'
```

Use `sk-demo-*` keys locally for demo sync without real provider APIs.

### Sync & usage

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/providers/<ID>/sync
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/v1/usage?limit=20"
```

### Seed pricing table

```bash
npm run db:seed
```

## Sprint status

See `../PRODUCT_DEVELOPMENT_ROADMAP.md` for full sprint plan.

| Sprint | Focus |
|--------|--------|
| 0 | Schema, health, orgs, teams, dashboard stub |
| 1 | Auth (Clerk), invites, RBAC |
| 2 | Provider adapters + usage sync |
| 3 | Analytics aggregations + cache |
| 4 | Budgets + alerts + notifications |
| 5 | Security + audit + Docker prod |
| 6 | Beta |

## Environment

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis (Sprint 2+ jobs) |
| `PORT` | API port (default 3001) |
| `CREDENTIALS_ENCRYPTION_KEY` | Provider credential encryption |
