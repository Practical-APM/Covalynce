import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Code2,
  Layers,
  Plug,
  Rocket,
  Route,
  Shield,
  Wallet,
} from "lucide-react";

export type HelpNavItem = {
  href: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

export type HelpNavGroup = {
  title: string;
  items: HelpNavItem[];
};

export const docsNav: HelpNavGroup[] = [
  {
    title: "Start here",
    items: [
      { href: "/help", label: "Help home", description: "Find answers by task", icon: BookOpen },
      {
        href: "/help/getting-started",
        label: "Getting started",
        description: "~5 min setup",
        icon: Rocket,
      },
      {
        href: "/help/concepts",
        label: "Concepts & glossary",
        description: "Terms in plain language",
        icon: Layers,
      },
    ],
  },
  {
    title: "Use the product",
    items: [
      {
        href: "/help/features/overview",
        label: "Overview dashboard",
        description: "Spend, budgets, trends",
        icon: BarChart3,
      },
      {
        href: "/help/features/providers",
        label: "Providers",
        description: "Connect OpenAI, Anthropic, Gemini",
        icon: Plug,
      },
      {
        href: "/help/features/budgets",
        label: "Budgets & alerts",
        description: "Caps and notifications",
        icon: Wallet,
      },
      {
        href: "/help/features/gateway",
        label: "AI Gateway",
        description: "Proxy for live control",
        icon: Route,
      },
      {
        href: "/help/features/gateway-attribution",
        label: "Gateway attribution",
        description: "Headers for team/agent spend",
      },
      {
        href: "/help/features/policies",
        label: "Policies",
        description: "Allow, deny, hard caps",
        icon: Shield,
      },
      { href: "/help/features/insights", label: "Insights", description: "Savings & anomalies" },
      {
        href: "/help/editions",
        label: "Community vs Enterprise",
        description: "Plans and self-host",
      },
    ],
  },
  {
    title: "Developers",
    items: [
      { href: "/help/api", label: "API reference", description: "REST with examples", icon: Code2 },
      { href: "/help/api/authentication", label: "Authentication", description: "JWT sessions" },
      { href: "/help/api/gateway", label: "Gateway endpoints", description: "OpenAI-compatible routes" },
    ],
  },
];

export const flatDocsNav = docsNav.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.title }))
);

export function getDocNeighbors(pathname: string) {
  const idx = flatDocsNav.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== "/help" && pathname.startsWith(item.href))
  );
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flatDocsNav[idx - 1] : null,
    next: idx < flatDocsNav.length - 1 ? flatDocsNav[idx + 1] : null,
  };
}

/** Task-first entry points on Help home */
export const helpTasks = [
  {
    href: "/help/getting-started",
    title: "Set up my workspace",
    description: "Create an org, connect a provider, see spend on Overview.",
    time: "5 min",
  },
  {
    href: "/help/features/providers",
    title: "Connect OpenAI or Anthropic",
    description: "OAuth or API key—what to use and where to click.",
    time: "3 min",
  },
  {
    href: "/help/features/overview",
    title: "Read my Overview dashboard",
    description: "Total spend, budget %, top models and teams.",
    time: "2 min",
  },
  {
    href: "/help/features/budgets",
    title: "Set a budget and alerts",
    description: "Monthly caps and Slack or email when thresholds hit.",
    time: "4 min",
  },
  {
    href: "/help/features/gateway",
    title: "Route apps through the Gateway",
    description: "When you need request-time policy, not just billing sync.",
    time: "6 min",
  },
  {
    href: "/help/api",
    title: "Integrate with the API",
    description: "JWT auth, provider sync, and gateway endpoints.",
    time: "10 min",
  },
] as const;

export const helpByRole = [
  {
    role: "Finance & FP&A",
    links: [
      { href: "/help/features/overview", label: "Overview & utilization" },
      { href: "/help/features/budgets", label: "Budgets & alerts" },
      { href: "/help/concepts#attribution", label: "Attribution glossary" },
    ],
  },
  {
    role: "Platform engineering",
    links: [
      { href: "/help/features/providers", label: "Provider connections" },
      { href: "/help/features/gateway", label: "AI Gateway" },
      { href: "/help/api", label: "API reference" },
    ],
  },
  {
    role: "Security & governance",
    links: [
      { href: "/help/features/policies", label: "Policies" },
      { href: "/help/features/gateway-attribution", label: "Attribution headers" },
      { href: "/help/editions", label: "Enterprise compliance" },
    ],
  },
] as const;

export const glossaryTerms = [
  {
    id: "overview",
    term: "Overview",
    definition:
      "The home dashboard: total AI spend, budget utilization, daily trend, and top models and teams for the date range you select.",
    related: "/help/features/overview",
  },
  {
    id: "provider",
    term: "Provider",
    definition:
      "A connected AI vendor account (OpenAI, Anthropic, Google Gemini). Covalynce syncs billing and usage on a schedule.",
    related: "/help/features/providers",
  },
  {
    id: "sync",
    term: "Sync",
    definition:
      "A background job (about every 15 minutes) that pulls new usage from connected providers. Failed or overdue syncs surface on Overview.",
    related: "/help/features/providers",
  },
  {
    id: "attribution",
    term: "Attribution",
    definition:
      "Mapping each dollar to a team, user, model, or agent so finance can charge back or investigate spikes.",
    related: "/help/features/gateway-attribution",
  },
  {
    id: "budget",
    term: "Budget",
    definition:
      "A monthly spending cap for the organization or a team. Utilization = spend ÷ budget, shown as a percentage on Overview.",
    related: "/help/features/budgets",
  },
  {
    id: "utilization",
    term: "Utilization",
    definition:
      "Percentage of budget consumed in the current period. Crossing configured thresholds triggers alerts.",
    related: "/help/features/budgets",
  },
  {
    id: "gateway",
    term: "Gateway",
    definition:
      "A proxy between your app and AI vendors. Apps use a Covalynce gateway key (gk_…) so every request is logged and policies can run in real time.",
    related: "/help/features/gateway",
  },
  {
    id: "policy",
    term: "Policy",
    definition:
      "A rule that allows, denies, or hard-caps usage—for example blocking a model for certain teams or stopping org spend at a limit.",
    related: "/help/features/policies",
  },
  {
    id: "agent",
    term: "Agent",
    definition:
      "A named AI application (support bot, codegen tool). Attribute gateway spend with the X-Covalynce-Agent-Id header.",
    related: "/help/features/gateway-attribution",
  },
  {
    id: "insight",
    term: "Insight",
    definition:
      "An automatic recommendation—such as switching to a cheaper model—or a flagged spend anomaly versus recent history.",
    related: "/help/features/insights",
  },
] as const;

export const pageRelated: Record<string, { href: string; label: string }[]> = {
  "/help/getting-started": [
    { href: "/help/features/providers", label: "Providers" },
    { href: "/help/concepts", label: "Glossary" },
    { href: "/dashboard", label: "Open Overview" },
  ],
  "/help/features/overview": [
    { href: "/help/features/providers", label: "Connect providers" },
    { href: "/help/features/budgets", label: "Budgets & alerts" },
    { href: "/dashboard", label: "Open Overview" },
  ],
  "/help/features/providers": [
    { href: "/help/getting-started", label: "Getting started" },
    { href: "/help/features/gateway", label: "AI Gateway" },
    { href: "/providers", label: "Manage providers" },
  ],
  "/help/features/budgets": [
    { href: "/help/features/overview", label: "Overview dashboard" },
    { href: "/budgets", label: "Manage budgets" },
    { href: "/alerts/settings", label: "Alert settings" },
  ],
  "/help/features/gateway": [
    { href: "/help/features/gateway-attribution", label: "Attribution headers" },
    { href: "/help/api/gateway", label: "Gateway API" },
    { href: "/gateway", label: "Manage gateway keys" },
  ],
  "/help/features/gateway-attribution": [
    { href: "/help/features/gateway", label: "Gateway overview" },
    { href: "/agents", label: "Register agents" },
  ],
  "/help/features/policies": [
    { href: "/help/features/gateway", label: "AI Gateway" },
    { href: "/policies", label: "Manage policies" },
  ],
  "/help/features/insights": [
    { href: "/help/features/overview", label: "Overview" },
    { href: "/insights", label: "Open Insights" },
  ],
  "/help/api": [
    { href: "/help/api/authentication", label: "Authentication" },
    { href: "/help/api/gateway", label: "Gateway endpoints" },
  ],
};
