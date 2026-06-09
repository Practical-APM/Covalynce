# Covalynce Community Edition

Apache 2.0 licensed subset for self-hosted deployments. **Free to use** — no platform fee.

**Public comparison:** run the app and open `/editions`, or Help → **Community vs Enterprise** after sign-in.

## Community (open source)

| Feature | Included |
|---------|----------|
| Single organization | Yes |
| Unlimited users | Yes |
| Provider adapters (OpenAI demo + 1 production) | OpenAI in community; Anthropic/Gemini commercial |
| Dashboard & usage explorer | Yes |
| Team attribution | Yes |
| Budgets (monitoring) | Yes |
| Alerts (in-app) | Yes |
| Self-host Docker bundle | Yes |
| JWT / magic-link auth | Yes |
| Cost centers & chargeback CSV | Yes |

## Commercial (Enterprise)

| Feature | Edition |
|---------|---------|
| SSO (Clerk / Auth0) | Enterprise |
| Custom RBAC overrides | Enterprise |
| Multi-organization switching | Enterprise |
| Compliance export bundle | Enterprise |
| Slack / email alerts at scale | Growth+ |
| All provider adapters | Growth+ |
| Gateway / policy engine | Platform (v2+) |

## Enforcement (API + UI)

Community organizations (`plan: community`, default on create) are blocked from enterprise APIs unless licensed:

| Capability | API guard | UI |
|------------|-----------|-----|
| SSO config & exchange | `sso` | Settings → SSO upsell; exchange gated (mock SSO excepted) |
| Compliance export | `compliance_export` | Reports & Audit export hidden |
| Multi-org switch | `multi_org` | Org switcher hidden |
| RBAC matrix edits | `rbac_overrides` | Permissions switches disabled |

**Self-host unlock:** set `COVALYNCE_LICENSE_KEY` (any non-empty value) or `COVALYNCE_EDITION=enterprise` on the API. Per-org upgrades: set `organization.plan` to `enterprise` in the database.

```env
COVALYNCE_EDITION=community   # community | enterprise (deployment default)
COVALYNCE_LICENSE_KEY=        # non-empty unlocks enterprise features for all orgs on this deployment
SSO_MOCK_ENABLED=true         # dev: SSO exchange without enterprise (do not use in production)
```

## Repository layout (future split)

```
covalynce/
├── packages/core/          # Apache 2.0 — API, dashboard, OpenAI adapter
├── packages/enterprise/    # Commercial — SSO, audit exports, extra adapters
└── LICENSE-COMMERCIAL
```

Current monorepo ships all code in one tree; edition guards gate commercial surfaces at runtime.

## Contributing

Community contributions welcome on core visibility and ingestion features. See [QUICKSTART.md](./QUICKSTART.md) to run locally.
