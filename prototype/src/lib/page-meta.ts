export interface PageMeta {
  title: string;
  description: string;
  help?: string;
  docHref?: string;
}

export const PAGE_META: Record<string, PageMeta> = {
  "/dashboard": {
    title: "Overview",
    description:
      "See total AI spend, budget usage, and where costs concentrate across providers and teams.",
    help: "This is your home page. Change the date range to update all charts. Connect providers first if numbers are empty.",
    docHref: "/help/features/overview",
  },
  "/usage": {
    title: "Usage",
    description:
      "Line-by-line record of AI API usage. Filter by team, user, or model to investigate spikes.",
    help: "Each row is one billed request or usage event from a connected provider.",
    docHref: "/help/concepts#attribution",
  },
  "/models": {
    title: "Models",
    description:
      "Cost and request volume per AI model (e.g. gpt-4o, claude-sonnet).",
    help: "Model share is that model's cost divided by total spend in the period.",
    docHref: "/help/features/overview",
  },
  "/providers": {
    title: "Providers",
    description:
      "Connect OpenAI, Anthropic, or Gemini. Sync runs automatically every 15 minutes.",
    docHref: "/help/features/providers",
  },
  "/teams": {
    title: "Teams",
    description:
      "Organize people into teams for spend attribution and team-level budgets.",
    help: "Teams group users so finance can see which department drives AI cost.",
    docHref: "/help/concepts#attribution",
  },
  "/users": {
    title: "Users",
    description:
      "Everyone using AI in your organization and their individual spend.",
    docHref: "/help/concepts#attribution",
  },
  "/budgets": {
    title: "Budgets",
    description:
      "Set monthly spending limits for the organization or specific teams.",
    help: "Budget utilization on Overview equals spend divided by this budget.",
    docHref: "/help/features/budgets",
  },
  "/alerts": {
    title: "Alerts",
    description:
      "Notifications when spend crosses thresholds you define.",
    docHref: "/help/features/budgets",
  },
  "/gateway": {
    title: "Gateway",
    description:
      "Route LLM requests through Covalynce to log usage and enforce policies in real time.",
    help: "Create a gateway key (gk_...) and point your OpenAI SDK base URL here instead of api.openai.com.",
    docHref: "/help/features/gateway",
  },
  "/agents": {
    title: "Agents",
    description:
      "Register AI applications (bots, tools) and track spend per agent.",
    help: "Send X-Covalynce-Agent-Id on gateway requests to attribute cost to an agent.",
    docHref: "/help/concepts#agent",
  },
  "/policies": {
    title: "Policies",
    description:
      "Rules to allow, deny, or cap AI usage by model, team, or organization.",
    docHref: "/help/features/policies",
  },
  "/insights": {
    title: "Insights",
    description:
      "Cost-saving recommendations and unusual spend detection.",
    docHref: "/help/features/insights",
  },
  "/licenses": {
    title: "Licenses",
    description:
      "Track enterprise AI subscriptions (Copilot, ChatGPT Enterprise, etc.) alongside API spend.",
    docHref: "/help/concepts",
  },
  "/reports": {
    title: "Reports",
    description:
      "Export summaries for finance reviews and leadership updates.",
    docHref: "/help/getting-started",
  },
  "/settings": {
    title: "Settings",
    description: "Organization profile, members, billing, and security.",
    docHref: "/help/getting-started",
  },
};
