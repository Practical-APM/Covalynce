/**
 * Product editions — single source for landing, help, and in-app labels.
 * Aligns with COMMUNITY_EDITION.md and PRD open-source architecture.
 */

export type ProductEdition = "community" | "enterprise";

export const EDITION_LABELS: Record<ProductEdition, string> = {
  community: "Community Edition",
  enterprise: "Enterprise Edition",
};

/** Normalize API/mock plan strings to a display edition */
export function planToEdition(plan?: string | null): ProductEdition {
  const p = (plan ?? "community").toLowerCase();
  if (p === "community" || p === "free") return "community";
  return "enterprise";
}

export function editionLabel(plan?: string | null): string {
  return EDITION_LABELS[planToEdition(plan)];
}

export function editionIsFree(plan?: string | null): boolean {
  return planToEdition(plan) === "community";
}

export const EDITION_COMPARISON = {
  community: {
    tagline: "Explore solo or with a team. Free to self-host, no credit card.",
    price: "Free",
    license: "Apache 2.0 (open-core roadmap)",
    deploy: "Docker Compose on your infrastructure",
    highlights: [
      "Unified AI spend dashboard",
      "Teams, users, and model attribution",
      "Budgets and in-app alerts",
      "Provider connect (OpenAI, Anthropic, Gemini + demo Azure/Bedrock)",
      "Optional AI Gateway for request-time logging",
      "JWT or magic-link auth",
    ],
  },
  enterprise: {
    tagline: "Gatekept commercial edition — SSO, exports, and support for larger orgs.",
    price: "Custom",
    license: "Commercial license",
    deploy: "Hosted or dedicated self-host with SLA",
    highlights: [
      "Everything in Community Edition",
      "SSO (Clerk, Auth0, OIDC)",
      "Advanced RBAC and permission matrix",
      "Compliance & audit exports",
      "Multi-workspace / org switching",
      "Email & Slack alert delivery at scale",
      "Design-partner support & roadmap influence",
    ],
  },
} as const;

export const EDITION_FAQ = [
  {
    q: "Is the Community Edition really free?",
    a: "Yes. You can self-host Community Edition on your own infrastructure with no platform fee. You still pay your AI vendors (OpenAI, Anthropic, etc.) directly.",
  },
  {
    q: "What is the difference from Enterprise?",
    a: "Community Edition covers core FinOps visibility and optional gateway governance. Enterprise adds SSO, advanced access controls, compliance exports, commercial support, and hosted options.",
  },
  {
    q: "Can I use Community Edition in production?",
    a: "Yes, for teams comfortable self-hosting and operating Postgres/Redis. Use Enterprise when you need SSO, formal audit exports, or a supported hosted deployment.",
  },
  {
    q: "I'm one person — is this for me?",
    a: "Yes. Start on Community Edition: create a workspace, load sample data, and explore the product without inviting anyone. Enterprise is only relevant when you need org-wide SSO or formal exports.",
  },
  {
    q: "How is Enterprise gated?",
    a: "Community workspaces cannot enable SSO, compliance exports, multi-org switching, or custom RBAC overrides until the organization is upgraded or the deployment has a license key.",
  },
] as const;
