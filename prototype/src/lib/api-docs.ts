export interface ApiEndpoint {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  title: string;
  description: string;
  auth?: boolean;
  params?: { name: string; in: "query" | "path" | "body"; required?: boolean; description: string }[];
  exampleRequest?: string;
  exampleResponse?: string;
}

export interface ApiSection {
  id: string;
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const API_SECTIONS: ApiSection[] = [
  {
    id: "auth",
    title: "Authentication",
    description:
      "Most endpoints require a JWT from email login or SSO exchange. Send it as a Bearer token.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/login",
        title: "Email login",
        description:
          "Sign in with your work email and organization slug. Returns a JWT and user profile.",
        auth: false,
        exampleRequest: `curl -X POST ${API_BASE}/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@company.com","slug":"acme"}'`,
        exampleResponse: `{
  "accessToken": "eyJ...",
  "user": { "id": "...", "email": "you@company.com", "role": "ADMIN" }
}`,
      },
      {
        method: "POST",
        path: "/api/v1/auth/sso/exchange",
        title: "SSO token exchange",
        description:
          "Exchange an OIDC token from Clerk or Auth0 for a Covalynce session.",
        auth: false,
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard & analytics",
    description: "Read-only summaries for the Overview, Usage, and Models pages.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/dashboard",
        title: "Dashboard summary",
        description:
          "Total spend, budget utilization, top models, top teams, and daily spend for a date range.",
        auth: true,
        params: [
          {
            name: "range",
            in: "query",
            description: "mtd | last7 | last30 | last90",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/analytics/usage",
        title: "Usage breakdown",
        description: "Paginated usage events with filters by team, user, or model.",
        auth: true,
      },
    ],
  },
  {
    id: "providers",
    title: "Providers",
    description:
      "Connect AI vendors via OAuth (preferred) or API key fallback. Credentials are encrypted and never returned after connect.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/providers/oauth/:provider/start",
        title: "Start provider OAuth",
        description:
          "Preferred connect path. Returns authorization URL for OpenAI, Anthropic, or Gemini. Set PROVIDER_OAUTH_MOCK_ENABLED=true for local dev.",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/v1/providers/oauth/:provider/callback",
        title: "Complete provider OAuth",
        description:
          "Exchange authorization code for encrypted tokens and trigger initial sync.",
        auth: true,
        exampleRequest: `{
  "code": "auth-code-from-vendor",
  "state": "signed-state-from-start"
}`,
      },
      {
        method: "POST",
        path: "/api/v1/providers/connect",
        title: "Connect provider (API key)",
        description:
          "Fallback when OAuth is unavailable. Store an encrypted API key. Sync runs every 15 minutes.",
        auth: true,
        exampleRequest: `{
  "name": "OPENAI",
  "apiKey": "sk-..."
}`,
      },
      {
        method: "GET",
        path: "/api/v1/providers",
        title: "List providers",
        description: "All connected providers with sync status and last sync time.",
        auth: true,
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrations catalog",
    description:
      "Discover supported integrations, preferred auth methods, and embeddability for partner platforms.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/integrations/catalog",
        title: "List integrations",
        description:
          "Public catalog of integration types with preferred auth (OAuth vs API key) and OAuth availability flags.",
        auth: false,
      },
    ],
  },
  {
    id: "budgets",
    title: "Budgets & alerts",
    description: "Set spending limits and notification channels.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/budgets",
        title: "Create budget",
        description: "Monthly cap for the org or a specific team.",
        auth: true,
      },
      {
        method: "GET",
        path: "/api/v1/alerts",
        title: "List alerts",
        description: "Triggered threshold and anomaly alerts.",
        auth: true,
      },
    ],
  },
  {
    id: "gateway",
    title: "AI Gateway",
    description:
      "OpenAI-compatible proxy. Point your SDK base URL here and use a gateway key (gk_...) instead of vendor keys.",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/gateway/keys",
        title: "Create gateway key",
        description: "Issue a new gk_ key with optional RPM rate limit.",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/v1/gateway/v1/chat/completions",
        title: "OpenAI chat completions",
        description:
          "Drop-in replacement for OpenAI. Supports streaming. Records usage and enforces policies.",
        auth: false,
        params: [
          {
            name: "Authorization",
            in: "path",
            description: "Bearer gk_your_gateway_key",
          },
        ],
        exampleRequest: `curl -X POST ${API_BASE}/api/v1/gateway/v1/chat/completions \\
  -H "Authorization: Bearer gk_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`,
      },
      {
        method: "POST",
        path: "/api/v1/gateway/v1/route/completions",
        title: "Unified routing",
        description:
          "Single endpoint: model name selects OpenAI, Anthropic, or Gemini automatically.",
        auth: false,
      },
    ],
  },
  {
    id: "policies",
    title: "Policies",
    description: "Allow, deny, or cap models and teams.",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/policies",
        title: "List policy rules",
        description: "JSON rules with optional team scope.",
        auth: true,
      },
      {
        method: "POST",
        path: "/api/v1/policies/import/yaml",
        title: "Import YAML",
        description: "Bulk import policies from a YAML file.",
        auth: true,
      },
    ],
  },
];

export function methodColor(method: ApiEndpoint["method"]) {
  const map = {
    GET: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
    POST: "bg-primary/15 text-primary",
    PATCH: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    PUT: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    DELETE: "bg-destructive/15 text-destructive",
  };
  return map[method];
}
