export type Provider = "openai" | "anthropic" | "gemini";

export interface ProviderAccount {
  id: string;
  name: Provider;
  displayName: string;
  status: "connected" | "syncing" | "error";
  lastSync: string;
  monthlySpend: number;
  requests: number;
  tokens: number;
}

export interface Team {
  id: string;
  name: string;
  members: number;
  monthlySpend: number;
  budget: number;
  trend: number;
  topModel: string;
}

export interface UserSpend {
  id: string;
  name: string;
  email: string;
  team: string;
  requests: number;
  tokens: number;
  cost: number;
  trend: number;
}

export interface Budget {
  id: string;
  name: string;
  scope: "organization" | "team";
  limit: number;
  spent: number;
  period: string;
}

export interface Alert {
  id: string;
  type: "budget_threshold" | "spend_spike" | "provider_spike";
  title: string;
  message: string;
  severity: "warning" | "critical";
  timestamp: string;
  read: boolean;
}

export const organization = {
  name: "Acme Corp",
  plan: "community",
  totalSpend: 47832,
  monthlyBudget: 55000,
  activeUsers: 47,
  activeTeams: 6,
  totalRequests: 284_920,
  spendTrend: 12.4,
};

export const dailySpend = [
  { date: "May 28", spend: 1420, requests: 9200 },
  { date: "May 29", spend: 1580, requests: 10100 },
  { date: "May 30", spend: 1340, requests: 8800 },
  { date: "May 31", spend: 890, requests: 6100 },
  { date: "Jun 1", spend: 1120, requests: 7400 },
  { date: "Jun 2", spend: 1680, requests: 11200 },
  { date: "Jun 3", spend: 1540, requests: 9800 },
];

export const providers: ProviderAccount[] = [
  {
    id: "1",
    name: "openai",
    displayName: "OpenAI",
    status: "connected",
    lastSync: "2 min ago",
    monthlySpend: 24180,
    requests: 142_400,
    tokens: 89_200_000,
  },
  {
    id: "2",
    name: "anthropic",
    displayName: "Anthropic",
    status: "connected",
    lastSync: "4 min ago",
    monthlySpend: 16840,
    requests: 98_200,
    tokens: 52_100_000,
  },
  {
    id: "3",
    name: "gemini",
    displayName: "Google Gemini",
    status: "syncing",
    lastSync: "Syncing…",
    monthlySpend: 6812,
    requests: 44_320,
    tokens: 28_400_000,
  },
];

export const modelBreakdown = [
  { model: "gpt-4o", provider: "OpenAI", cost: 14200, share: 29.7 },
  { model: "claude-sonnet-4", provider: "Anthropic", cost: 11840, share: 24.8 },
  { model: "gpt-4o-mini", provider: "OpenAI", cost: 6840, share: 14.3 },
  { model: "gemini-2.0-flash", provider: "Gemini", cost: 5210, share: 10.9 },
  { model: "claude-haiku", provider: "Anthropic", cost: 4120, share: 8.6 },
  { model: "o3-mini", provider: "OpenAI", cost: 3140, share: 6.6 },
  { model: "Other", provider: "Mixed", cost: 2482, share: 5.1 },
];

export const teams: Team[] = [
  {
    id: "1",
    name: "Platform Engineering",
    members: 12,
    monthlySpend: 14280,
    budget: 15000,
    trend: 8.2,
    topModel: "gpt-4o",
  },
  {
    id: "2",
    name: "Product",
    members: 8,
    monthlySpend: 9840,
    budget: 12000,
    trend: 14.1,
    topModel: "claude-sonnet-4",
  },
  {
    id: "3",
    name: "Data Science",
    members: 6,
    monthlySpend: 8920,
    budget: 10000,
    trend: -3.4,
    topModel: "gpt-4o",
  },
  {
    id: "4",
    name: "Customer Success",
    members: 11,
    monthlySpend: 6240,
    budget: 8000,
    trend: 22.8,
    topModel: "gemini-2.0-flash",
  },
  {
    id: "5",
    name: "Marketing",
    members: 5,
    monthlySpend: 5180,
    budget: 6000,
    trend: 5.6,
    topModel: "claude-haiku",
  },
  {
    id: "6",
    name: "Security",
    members: 5,
    monthlySpend: 3372,
    budget: 5000,
    trend: 1.2,
    topModel: "gpt-4o-mini",
  },
];

export const users: UserSpend[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@acme.com",
    team: "Platform Engineering",
    requests: 18420,
    tokens: 12_400_000,
    cost: 4280,
    trend: 18.2,
  },
  {
    id: "2",
    name: "Marcus Webb",
    email: "marcus.webb@acme.com",
    team: "Data Science",
    requests: 14280,
    tokens: 9_800_000,
    cost: 3640,
    trend: 6.4,
  },
  {
    id: "3",
    name: "Priya Patel",
    email: "priya.patel@acme.com",
    team: "Product",
    requests: 12840,
    tokens: 8_200_000,
    cost: 3120,
    trend: 24.1,
  },
  {
    id: "4",
    name: "James Okonkwo",
    email: "james.okonkwo@acme.com",
    team: "Platform Engineering",
    requests: 11200,
    tokens: 7_400_000,
    cost: 2840,
    trend: -2.1,
  },
  {
    id: "5",
    name: "Elena Rodriguez",
    email: "elena.rodriguez@acme.com",
    team: "Customer Success",
    requests: 9840,
    tokens: 6_100_000,
    cost: 2180,
    trend: 31.4,
  },
  {
    id: "6",
    name: "Tom Bradley",
    email: "tom.bradley@acme.com",
    team: "Marketing",
    requests: 8420,
    tokens: 4_800_000,
    cost: 1920,
    trend: 8.7,
  },
  {
    id: "7",
    name: "Aisha Khan",
    email: "aisha.khan@acme.com",
    team: "Security",
    requests: 6240,
    tokens: 3_200_000,
    cost: 1640,
    trend: 4.2,
  },
  {
    id: "8",
    name: "David Park",
    email: "david.park@acme.com",
    team: "Product",
    requests: 5820,
    tokens: 2_900_000,
    cost: 1480,
    trend: 11.3,
  },
];

export const budgets: Budget[] = [
  {
    id: "1",
    name: "Organization",
    scope: "organization",
    limit: 55000,
    spent: 47832,
    period: "June 2026",
  },
  {
    id: "2",
    name: "Platform Engineering",
    scope: "team",
    limit: 15000,
    spent: 14280,
    period: "June 2026",
  },
  {
    id: "3",
    name: "Customer Success",
    scope: "team",
    limit: 8000,
    spent: 6240,
    period: "June 2026",
  },
  {
    id: "4",
    name: "Product",
    scope: "team",
    limit: 12000,
    spent: 9840,
    period: "June 2026",
  },
];

export const alerts: Alert[] = [
  {
    id: "1",
    type: "budget_threshold",
    title: "Platform Engineering at 95% budget",
    message: "Team has spent $14,280 of $15,000 monthly limit.",
    severity: "warning",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "spend_spike",
    title: "Customer Success spend up 22.8%",
    message: "Weekly spend increased significantly vs. prior period.",
    severity: "warning",
    timestamp: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "provider_spike",
    title: "OpenAI costs trending higher",
    message: "OpenAI spend is 18% above 30-day average.",
    severity: "critical",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: "4",
    type: "budget_threshold",
    title: "Organization at 87% budget",
    message: "Total AI spend is $47,832 of $55,000 monthly limit.",
    severity: "warning",
    timestamp: "Yesterday",
    read: true,
  },
];

export const providerColors: Record<Provider, string> = {
  openai: "var(--chart-1)",
  anthropic: "var(--chart-2)",
  gemini: "var(--chart-3)",
};

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  team: string;
  lastActive: string;
}

export const orgMembers: OrgMember[] = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@acme.com", role: "admin", team: "Platform Engineering", lastActive: "Now" },
  { id: "2", name: "Marcus Webb", email: "marcus.webb@acme.com", role: "manager", team: "Data Science", lastActive: "2h ago" },
  { id: "3", name: "Priya Patel", email: "priya.patel@acme.com", role: "manager", team: "Product", lastActive: "1h ago" },
  { id: "4", name: "James Okonkwo", email: "james.okonkwo@acme.com", role: "viewer", team: "Platform Engineering", lastActive: "Yesterday" },
  { id: "5", name: "Elena Rodriguez", email: "elena.rodriguez@acme.com", role: "viewer", team: "Customer Success", lastActive: "3h ago" },
];

export interface UsageRecord {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  user: string;
  team: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export const usageRecords: UsageRecord[] = Array.from({ length: 24 }, (_, i) => ({
  id: String(i + 1),
  timestamp: `Jun 3, 2026 ${14 - i}:00`,
  provider: ["OpenAI", "Anthropic", "Gemini"][i % 3]!,
  model: ["gpt-4o", "claude-sonnet-4", "gemini-2.0-flash"][i % 3]!,
  user: users[i % 8]?.name ?? "Unknown",
  team: teams[i % 6]?.name ?? "Unknown",
  inputTokens: 1200 + i * 80,
  outputTokens: 340 + i * 40,
  cost: 0.8 + i * 0.15,
}));

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
}

export const auditLog: AuditEntry[] = [
  { id: "1", actor: "Sarah Chen", action: "provider.connected", resource: "OpenAI", timestamp: "Jun 2, 10:24 AM" },
  { id: "2", actor: "Sarah Chen", action: "budget.updated", resource: "Platform Engineering", timestamp: "Jun 1, 4:12 PM" },
  { id: "3", actor: "Marcus Webb", action: "user.invited", resource: "elena.rodriguez@acme.com", timestamp: "May 30, 9:00 AM" },
  { id: "4", actor: "Sarah Chen", action: "alert.settings_updated", resource: "Slack webhook", timestamp: "May 28, 2:45 PM" },
  { id: "5", actor: "Priya Patel", action: "team.created", resource: "Product", timestamp: "May 15, 11:30 AM" },
];

export function getProviderById(id: string) {
  return providers.find((p) => p.id === id);
}

export function getTeamById(id: string) {
  return teams.find((t) => t.id === id);
}

export function getUserById(id: string) {
  return users.find((u) => u.id === id);
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description: string | null;
  teamName: string | null;
  monthToDateSpend: number;
}

export const costCenters: CostCenter[] = [
  {
    id: "cc-1",
    code: "ENG-PLATFORM",
    name: "Platform engineering",
    description: "Gateway traffic & shared infra",
    teamName: "Platform",
    monthToDateSpend: 14280,
  },
  {
    id: "cc-2",
    code: "PROD-AI",
    name: "Product AI features",
    description: "In-app copilot & semantic search",
    teamName: "Product",
    monthToDateSpend: 8640,
  },
  {
    id: "cc-3",
    code: "CS-BOT",
    name: "Support automation",
    description: "Customer success agent workloads",
    teamName: "Customer Success",
    monthToDateSpend: 3920,
  },
  {
    id: "cc-4",
    code: "RND-LAB",
    name: "R&D experiments",
    description: "Model eval & prototypes",
    teamName: "R&D",
    monthToDateSpend: 2180,
  },
];
