/**
 * Landing copy — every claim in this file is backed by a document in this repo.
 * Sources: PRD.md, COMMUNITY_EDITION.md, PRODUCT.md, VISION_AND_PRODUCT_STRATEGY.md
 * No invented statistics, no unverified claims.
 *
 * Voice: confident, precise, zero hype. Outcomes before mechanics.
 * Hero hook ("before the invoice arrives") bookends the page in the closing CTA.
 */

export const LANDING_SEO = {
  /** Social share title — one clear sentence */
  title: "Covalynce · Open-source AI spend visibility",
  description:
    "One dashboard for AI spend across OpenAI, Anthropic, and Gemini. See cost by team, model, and provider before the invoice arrives. Free to self-host, no credit card.",
  keywords: [
    "AI FinOps",
    "AI cost management",
    "LLM spend tracking",
    "AI budget monitoring",
    "AI cost attribution",
    "open source AI observability",
    "self-hosted AI dashboard",
    "Product Hunt",
  ],
};

/** Product Hunt tagline — keep under ~80 characters */
export const PRODUCT_HUNT_TAGLINE =
  "Open-source AI FinOps: unified spend before the invoice arrives.";

export const LANDING = {
  eyebrow: "Open Source · Community Edition",

  headline: "Every AI dollar, accounted for.",
  headlineAccent: "Before the invoice arrives.",
  subhead:
    "Finance gets one number it can trust. Engineering sees which team, model, and provider is behind it. Connect provider billing and the ledger fills itself; your developers change nothing.",
  ctaPrimary: "Start free",
  ctaSecondary: "Tour with sample data",
  ctaEnterprise: "Enterprise: SSO & compliance exports",

  problemEyebrow: "The problem",
  problemTitle: "The bill arrives. The breakdown doesn't.",
  problemLead:
    "AI spending is fragmented across provider dashboards, spreadsheets, and Slack threads. By the time finance asks which team drove last month's spike, the context is gone and the invoice is already paid.",
  problems: [
    {
      title: "No single source of truth",
      body: "OpenAI, Anthropic, and Gemini each report differently. Reconciliation happens in spreadsheets, after the fact.",
    },
    {
      title: "Chargeback without context",
      body: "Finance needs team and model breakdowns. Vendor consoles only show org-wide totals.",
    },
    {
      title: "Budgets with no guardrails",
      body: "Teams agree on monthly caps, but nobody gets warned until the spend has already happened.",
    },
  ],

  howEyebrow: "How it works",
  howTitle: "Connect. See. Control.",
  howLead:
    "Three steps from scattered provider billing to a spend ledger finance and engineering both trust.",
  howSteps: [
    {
      step: "01",
      title: "Connect providers",
      body: "Link OpenAI, Anthropic, or Gemini billing with an API key or OAuth. Covalynce syncs usage data in the background.",
      outcome: "Input: your billing credentials. No code changes required.",
    },
    {
      step: "02",
      title: "See unified spend",
      body: "Month-to-date totals roll up in one Overview. Drill down by organization, team, user, model, and provider.",
      outcome: "Output: one live ledger across all connected providers.",
    },
    {
      step: "03",
      title: "Set budgets and alerts",
      body: "Define monthly caps per team or organization. Get alerted in-app while there is still time to act.",
      outcome: "Outcome: visibility before the next invoice cycle.",
    },
  ],

  integrationsEyebrow: "Integrations",
  integrationsTitle: "Providers we support today",
  integrationsLead:
    "Billing sync is live for OpenAI, Anthropic, and Google Gemini. Azure OpenAI and AWS Bedrock are on the roadmap.",

  bleedEyebrow: "Product",
  bleedTitle: "What you see is what ships",
  bleedLead:
    "Overview, usage drill-down, budgets, and alerts, rendered from the live product views with labeled sample data. No staged mockups.",
  bleedPoints: [
    "Month-to-date totals across connected providers",
    "Drill-down by team, user, model, and provider",
    "Budget thresholds with in-app alerts",
  ],

  capabilitiesTitle: "From the total bill to the line that caused it",
  capabilitiesLead:
    "Four capabilities. Each one answers a question your finance or engineering team is already asking.",

  faqEyebrow: "Questions",
  faqTitle: "Straight answers",

  ctaTitle: "The next invoice doesn't have to be a surprise.",
  ctaLead:
    "Create a workspace, explore with sample data, then connect providers and invite your team. No credit card. Self-host with Docker Compose whenever you're ready.",

  footerTagline:
    "Community Edition is free to self-host under Apache 2.0. Enterprise is a separate commercial edition for teams that need SSO, compliance exports, and supported deployments.",

  audienceEyebrow: "Who it's for",
  audienceTitle: "Built for the teams holding the AI budget",
  audienceLead:
    "Finance needs numbers before close. Platform needs attribution without rewiring every app. Both get the same live ledger.",

  trustItems: [
    { label: "License", value: "Apache 2.0", detail: "Community core, self-host anywhere" },
    { label: "Deploy", value: "Docker Compose", detail: "API + database in one bundle" },
    { label: "Cost", value: "$0 platform fee", detail: "You pay providers directly" },
    { label: "Providers", value: "3 live", detail: "OpenAI, Anthropic, Gemini billing sync" },
  ],
};

export const LANDING_AUDIENCE = [
  {
    role: "Finance & FP&A",
    question: "How much did we spend on AI last month?",
    outcome: "Month-to-date totals across every connected provider. One number for the board deck.",
    icon: "finance" as const,
  },
  {
    role: "Platform engineering",
    question: "Which teams are driving the spike?",
    outcome: "Drill down by team, user, model, and provider without exporting CSVs from three consoles.",
    icon: "platform" as const,
  },
  {
    role: "Engineering leads",
    question: "Are we about to blow the budget?",
    outcome: "Budget utilization and in-app alerts before spend becomes a surprise invoice.",
    icon: "engineering" as const,
  },
];

export const CAPABILITIES = [
  {
    title: "Unified spend overview",
    body: "Connect provider billing and open one Overview for organization-wide month-to-date spend.",
    outcome: "Replaces the monthly spreadsheet export with a live, shared ledger.",
    diagram: "visibility" as const,
    accent: "primary" as const,
  },
  {
    title: "Cost attribution",
    body: "Attribute spend to organizations, teams, users, models, and providers: the dimensions chargebacks actually need.",
    outcome: "Shows which teams and models drive cost, not just the total bill.",
    diagram: "attribution" as const,
    accent: "violet" as const,
  },
  {
    title: "Budgets & alerts",
    body: "Set monthly caps per team or organization and receive in-app alerts as spend approaches your limit.",
    outcome: "Warns finance and engineering before spend becomes a surprise.",
    diagram: "budgets" as const,
    accent: "gold" as const,
  },
  {
    title: "Provider comparison",
    body: "See provider-level cost breakdowns side by side. Understand which providers your teams use most.",
    outcome: "Backs provider decisions with real usage data.",
    diagram: "gateway" as const,
    accent: "success" as const,
  },
];

export const FAQ_ITEMS = [
  {
    q: "Which AI providers does Covalynce support today?",
    a: "OpenAI, Anthropic, and Google Gemini with billing sync at launch. Azure OpenAI and AWS Bedrock are on the roadmap. The public feature matrix lists exactly what ships in each edition.",
  },
  {
    q: "Do developers need to change how they call AI APIs?",
    a: "No. Connect your provider billing credentials and Covalynce syncs usage data in the background. Your existing application code does not change.",
  },
  {
    q: "How is this different from watching my provider dashboards?",
    a: "Provider dashboards show spend in isolation. Covalynce aggregates all providers into one place and lets you slice by team, user, and model: dimensions no single provider dashboard supports.",
  },
  {
    q: "Can I try it without inviting my whole team?",
    a: "Yes. Sign up, load sample data, and explore the dashboard alone. Invite teammates from Settings when you are ready.",
  },
  {
    q: "Is Community Edition genuinely free?",
    a: "Yes. No platform fee. You continue paying your AI providers directly. Community Edition is Apache 2.0 licensed and free to self-host. Enterprise is a separate commercial product for SSO, compliance exports, and supported deployments.",
  },
  {
    q: "What does Enterprise add?",
    a: "SSO (Clerk / Auth0), custom RBAC overrides, multi-organization switching, and compliance export bundles. Everything else (dashboards, attribution, budgets, alerts) is in Community Edition.",
  },
];
