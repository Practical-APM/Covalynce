/**
 * Landing copy — every claim in this file is backed by a document in this repo.
 * Sources: PRD.md, COMMUNITY_EDITION.md, PRODUCT.md, VISION_AND_PRODUCT_STRATEGY.md
 * No invented statistics, no unverified claims.
 */

export const LANDING_SEO = {
  /** Product Hunt & social share title — one clear sentence */
  title: "Covalynce — Open-source AI spend visibility",
  description:
    "One dashboard for AI spend across OpenAI, Anthropic, and Gemini. Finance and platform teams see cost by team, model, and provider — free to self-host, no credit card.",
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
  "Open-source AI FinOps — unified spend before the invoice arrives.";

/** YC-style one-liner — problem + solution in one breath */
export const YC_ONE_LINER =
  "Covalynce is the FinOps control plane for enterprise AI — we aggregate LLM billing from every provider into one ledger finance and engineering can share.";

export const LANDING = {
  eyebrow: "Open Source · Community Edition",

  headline: "Know where your AI spend is going.",
  headlineAccent: "Before the invoice arrives.",
  subhead:
    "Covalynce connects to your AI provider billing, aggregates spend by team, user, model, and provider, and surfaces it in one dashboard — without changing how your developers work.",
  ctaPrimary: "Start free",
  ctaSecondary: "Tour with sample data",
  ctaEnterprise: "Enterprise (SSO & compliance exports)",

  // Truthful stats backed by COMMUNITY_EDITION.md
  heroStats: [
    { value: "3", label: "billing providers supported at launch" },
    { value: "$0", label: "platform fee — self-host with Docker" },
    { value: "Apache 2.0", label: "open source license" },
  ],

  problemEyebrow: "The problem",
  problemTitle: "The bill arrives. The breakdown doesn't.",
  problemLead:
    "AI spending is fragmented across provider dashboards, spreadsheets, and Slack threads. By the time finance asks which team drove last month's spike, the context is gone and the invoice is already paid.",
  problems: [
    {
      title: "No single source of truth",
      body: "OpenAI, Anthropic, and Gemini each report differently. Reconciliation happens in spreadsheets — after the fact.",
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
    "Three steps from scattered provider billing to a shared spend ledger your finance and engineering teams can trust.",
  howSteps: [
    {
      step: "01",
      title: "Connect providers",
      body: "Link OpenAI, Anthropic, or Gemini billing with an API key or OAuth. Covalynce syncs usage data periodically in the background.",
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
      body: "Define monthly caps per team or organization. Receive in-app alerts when spend approaches your threshold.",
      outcome: "Outcome: visibility before the next invoice cycle.",
    },
  ],

  integrationsEyebrow: "Integrations",
  integrationsTitle: "Providers we support today",
  integrationsLead:
    "Billing sync is live for OpenAI, Anthropic, and Google Gemini. Azure OpenAI and AWS Bedrock are on the roadmap.",

  bleedEyebrow: "Product",
  bleedTitle: "The same dashboard your team will use",
  bleedLead:
    "Overview, usage drill-down, budget monitoring, and in-app alerts — shown here exactly as they appear in the product.",
  bleedPoints: [
    "Month-to-date totals across connected providers",
    "Drill-down by team, user, model, and provider",
    "Budget thresholds with in-app alerts",
  ],

  pillarsEyebrow: "Capabilities",
  pillarsTitle: "From visibility to control",
  pillarsLead:
    "Start with a unified view. Add attribution and budget guardrails as your team grows.",

  capabilitiesTitle: "Built for engineering and finance teams",
  capabilitiesLead:
    "Each capability maps directly to a question your finance or engineering team is already asking.",

  evidenceEyebrow: "What you get",
  evidenceTitle: "Honest about what's included",
  evidenceLead:
    "Community Edition is free to self-host under Apache 2.0. Enterprise adds SSO, compliance exports, and custom RBAC.",
  evidenceItems: [
    {
      stat: "OpenAI",
      unit: "Anthropic · Gemini",
      label: "Three billing providers connected at launch",
    },
    {
      stat: "Team",
      unit: "· User · Model",
      label: "Attribution dimensions across the dashboard",
    },
    {
      stat: "Free",
      unit: "forever",
      label: "Community Edition — no platform fee, self-hosted",
    },
  ],

  faqEyebrow: "Questions",
  faqTitle: "Straight answers",

  ctaTitle: "Start with sample data. Connect providers when ready.",
  ctaLead:
    "Create a workspace, explore the dashboard alone, then invite your team. No credit card. Self-host on Docker when you are ready.",
  ctaWorksWith: "Works with",

  footerTagline:
    "Community Edition is free to self-host under Apache 2.0. Enterprise is a separate commercial edition for teams that need SSO, compliance exports, and supported deployments.",

  audienceEyebrow: "Who it's for",
  audienceTitle: "Built for the teams holding the AI budget",
  audienceLead:
    "Finance needs numbers before close. Platform needs attribution without rewiring every app. Covalynce gives both sides the same live ledger.",

  whyNowEyebrow: "Why now",
  whyNowTitle: "Cloud FinOps happened in the 2010s. AI FinOps is next.",
  whyNowLead:
    "Enterprise AI spend is fragmenting across OpenAI, Anthropic, Gemini, Azure, and internal agents — faster than cloud did a decade ago. Organizations need the same visibility layer CloudHealth and Finout brought to AWS.",
  whyNowPoints: [
    {
      title: "Spend is exploding, visibility isn't",
      body: "Every team can spin up API keys. Finance still reconciles three vendor consoles and a spreadsheet after the invoice lands.",
    },
    {
      title: "Attribution is a finance problem now",
      body: "Chargebacks need team, user, and model dimensions — data no single provider dashboard exposes.",
    },
    {
      title: "Open source wins trust",
      body: "Finance and security teams want to self-host spend data. Community Edition is Apache 2.0 with a Docker bundle — no platform fee.",
    },
  ],

  trustEyebrow: "Launch ready",
  trustTitle: "Honest positioning — no inflated claims",
  trustLead:
    "We ship what we document. Community Edition is live today; Enterprise is for teams that need SSO and compliance exports.",
  trustItems: [
    { label: "License", value: "Apache 2.0", detail: "Community core — self-host anywhere" },
    { label: "Deploy", value: "Docker Compose", detail: "API + database in one bundle" },
    { label: "Cost", value: "$0 platform fee", detail: "You pay providers directly" },
    { label: "Providers", value: "3 live", detail: "OpenAI, Anthropic, Gemini billing sync" },
  ],
};

export const LANDING_AUDIENCE = [
  {
    role: "Finance & FP&A",
    question: "How much did we spend on AI last month?",
    outcome: "Month-to-date totals across every connected provider — one number for the board deck.",
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

export const LANDING_PILLARS = [
  {
    title: "Unified visibility",
    body: "Pull month-to-date spend from OpenAI, Anthropic, and Gemini billing into one Overview.",
    outcome: "Answer 'what did we spend?' without exporting spreadsheets.",
    color: "primary" as const,
  },
  {
    title: "Cost attribution",
    body: "See which organizations, teams, users, and models are driving spend — all from the same dataset.",
    outcome: "Support chargeback conversations with actual data.",
    color: "violet" as const,
  },
  {
    title: "Budget monitoring",
    body: "Set monthly caps per team or organization. In-app alerts fire before spend hits your limit.",
    outcome: "Engineering and finance aligned on the same numbers.",
    color: "gold" as const,
  },
];

export const CAPABILITIES = [
  {
    title: "Unified spend overview",
    body: "Connect provider billing and open one Overview for organization-wide month-to-date spend.",
    outcome: "Replace manual spreadsheet exports with a live, shared ledger.",
    diagram: "visibility" as const,
    accent: "primary" as const,
  },
  {
    title: "Cost attribution",
    body: "Attribute spend to organizations, teams, users, models, and providers — the dimensions that matter for chargebacks.",
    outcome: "Show which teams and models drive cost, not just the total bill.",
    diagram: "attribution" as const,
    accent: "violet" as const,
  },
  {
    title: "Budgets & alerts",
    body: "Set monthly caps per team or organization and receive in-app alerts as spend approaches your limit.",
    outcome: "Finance and engineering get warned before spend becomes a surprise.",
    diagram: "budgets" as const,
    accent: "gold" as const,
  },
  {
    title: "Provider comparison",
    body: "See provider-level cost breakdowns side-by-side. Understand which providers your teams use most.",
    outcome: "Make informed provider decisions with real usage data.",
    diagram: "gateway" as const,
    accent: "success" as const,
  },
];

export const FAQ_ITEMS = [
  {
    q: "Which AI providers does Covalynce support today?",
    a: "OpenAI, Anthropic, and Google Gemini with billing sync at launch. Azure OpenAI and AWS Bedrock are on the roadmap. See COMMUNITY_EDITION.md for the full feature matrix.",
  },
  {
    q: "Do developers need to change how they call AI APIs?",
    a: "No. Connect your provider billing credentials and Covalynce syncs usage data in the background. Your existing application code does not change.",
  },
  {
    q: "How is this different from watching my provider dashboards?",
    a: "Provider dashboards show spend in isolation. Covalynce aggregates all providers into one place and lets you slice by team, user, and model — dimensions no single provider dashboard supports.",
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
    a: "SSO (Clerk / Auth0), custom RBAC overrides, multi-organization switching, and compliance export bundles. Everything else — dashboards, attribution, budgets, alerts — is in Community Edition.",
  },
];


