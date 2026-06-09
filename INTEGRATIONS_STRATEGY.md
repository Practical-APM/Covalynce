# Covalynce — Integrations Strategy

**Principle:** Prefer **OAuth 2.0 / OIDC** wherever a vendor supports delegated, revocable access. Use **API keys** only when the vendor has no OAuth path, for machine-to-machine calls, or for Covalynce-issued credentials (Gateway keys).

This keeps Covalynce easy to plug into enterprise IdPs, SaaS tools, and AI platforms without asking users to copy secrets when OAuth is available.

---

## Auth method by integration type

| Integration | Preferred auth | Fallback | Why |
|-------------|----------------|----------|-----|
| **User login (SSO)** | OAuth / OIDC (Clerk, Auth0, Okta) | Email + org slug (dev) | Standard enterprise SSO |
| **OpenAI (usage/billing)** | OAuth (org admin consent) | Admin API key | OAuth = revocable, scoped, audit-friendly |
| **Anthropic** | OAuth (when available) | Admin API key | Same as above |
| **Google Gemini / GCP** | OAuth (Google Cloud) | Service account key | GCP billing is OAuth-native |
| **Azure OpenAI** | OAuth (Microsoft Entra) | API key + resource name | Enterprise default |
| **AWS Bedrock** | IAM role / OAuth (future) | Access key (scoped) | Keys only when IAM delegation unavailable |
| **Slack alerts** | OAuth (workspace install) | Incoming webhook URL | OAuth for multi-workspace SaaS |
| **Covalynce Gateway** | **API key (`gk_…`)** | — | Apps call *us*; keys are the product surface |
| **Outbound webhooks** | HMAC signing secret | — | Not OAuth; verify payload integrity |
| **Compliance export / REST API** | Bearer JWT (user session) | — | Consumer of our API, not a vendor |

---

## Credential storage

All vendor credentials (OAuth tokens or API keys) are:

- Encrypted at rest (`encryptedCredentials` on `Provider`)
- Tagged with `authType`: `OAUTH` | `API_KEY`
- Never returned to the client after connect
- Refreshable for OAuth (refresh token rotation when vendor supports it)

Canonical stored shape:

```json
{
  "authType": "OAUTH",
  "accessToken": "…",
  "refreshToken": "…",
  "expiresAt": "2026-06-03T12:00:00.000Z",
  "scopes": ["billing.read"]
}
```

```json
{
  "authType": "API_KEY",
  "apiKey": "sk-…",
  "organizationId": "optional-vendor-org-id"
}
```

---

## OAuth connect flow (providers)

```text
User → "Connect with OpenAI" (UI)
     → GET /api/v1/providers/oauth/:provider/start
     → Redirect to vendor consent screen
     → Vendor redirects to /providers/oauth/callback?code=&state=
     → POST /api/v1/providers/oauth/:provider/callback
     → Encrypted tokens stored, sync job queued
```

**Dev / demo:** Set `PROVIDER_OAUTH_MOCK_ENABLED=true` to simulate consent without real vendor OAuth apps.

---

## API-first embeddability

Every integration must be reachable via REST so Covalynce can be embedded in:

- Internal developer portals
- Terraform / Pulumi modules
- CI pipelines (compliance export)
- Partner marketplaces (OAuth app registration)

Public catalog: `GET /api/v1/integrations/catalog`

---

## Implementation status

| Area | Status |
|------|--------|
| SSO OIDC exchange | Shipped |
| Provider OAuth start/callback API | Shipped (mock + real-ready) |
| Provider API key connect | Shipped (fallback) |
| OAuth-first provider UI | Shipped |
| Real OpenAI/Google OAuth apps | Configure via env (see `api/.env.example`) |
| Slack OAuth | Planned |
| Azure / Bedrock OAuth | Planned |

---

## Environment variables (real OAuth)

```bash
# OpenAI OAuth (when app registered)
OPENAI_OAUTH_CLIENT_ID=
OPENAI_OAUTH_CLIENT_SECRET=
OPENAI_OAUTH_REDIRECT_URI=http://localhost:3000/providers/oauth/callback

# Google / Gemini
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/providers/oauth/callback

# Mock OAuth for local dev (no vendor app needed)
PROVIDER_OAUTH_MOCK_ENABLED=true
```

Gateway keys, Resend, and other **outbound service API keys** remain env-based for the Covalynce deployment itself—not end-user integrations.
