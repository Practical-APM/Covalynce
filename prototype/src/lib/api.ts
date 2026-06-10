import {
  clearSession,
  getStoredRefreshToken,
  getStoredToken,
  updateAccessTokens,
} from "./auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const SESSION_EXPIRED_KEY = "covalynce_session_expired";

type UnauthorizedHandler = () => void;
type ApiErrorHandler = (message: string) => void;
let onUnauthorized: UnauthorizedHandler | null = null;
let onApiError: ApiErrorHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

export function setApiErrorHandler(handler: ApiErrorHandler | null) {
  onApiError = handler;
}

function parseApiErrorMessage(status: number, text: string): string {
  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join(", ");
    if (json.message) return json.message;
  } catch {
    /* plain text */
  }
  if (text.length > 0 && text.length < 200) return text;
  return `Request failed (${status})`;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { auth?: boolean; silent?: boolean; _retried?: boolean }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (options?.auth !== false) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && options?.auth !== false) {
    if (!options?._retried && getStoredRefreshToken()) {
      const refreshed = await tryRefreshSession();
      if (refreshed) {
        return apiFetch<T>(path, { ...options, _retried: true });
      }
    }
    clearSession();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");
    }
    onUnauthorized?.();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const text = await res.text();
    const message = parseApiErrorMessage(res.status, text);
    if (!options?.silent) {
      onApiError?.(message);
    }
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

async function tryRefreshSession(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
    };
    updateAccessTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export type CreateOrgResponse = {
  organization: { id: string; name: string; slug: string; plan: string };
  user: { id: string; email: string; name: string | null; role: string; organizationId: string };
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
};

export type LoginResponse = CreateOrgResponse;

export type OrgMember = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export type InstanceSettingItem = {
  key: string;
  label: string;
  group: "email" | "oauth_openai" | "oauth_anthropic" | "oauth_google";
  secret: boolean;
  placeholder: string | null;
  helpAnchor: string | null;
  source: "database" | "environment" | "none";
  preview: string | null;
  updatedAt: string | null;
};

export type InstanceStatus = {
  databaseConnected: boolean;
  authMode: string;
  nodeEnv: string;
  jwtSecret: { set: boolean; isDefault: boolean };
  encryptionKey: { set: boolean; isDefault: boolean };
  emailConfigured: boolean;
  frontendUrl: string | null;
  corsOrigin: string | null;
};

export const api = {
  health: () => apiFetch<{ status: string }>("/api/v1/health", { auth: false }),

  authConfig: () =>
    apiFetch<{
      mode: string;
      passwordlessLoginAllowed: boolean;
      magicLinkEnabled: boolean;
      ssoRequired: boolean;
      emailDeliveryConfigured: boolean;
    }>("/api/v1/auth/config", { auth: false }),

  updateOrganization: (id: string, body: { name: string }) =>
    apiFetch<{ id: string; name: string; slug: string; plan: string }>(
      `/api/v1/organizations/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    ),

  createOrganization: (body: {
    name: string;
    slug: string;
    adminEmail: string;
    adminName?: string;
  }) =>
    apiFetch<CreateOrgResponse>("/api/v1/organizations", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  login: (body: { email: string; organizationSlug: string }) =>
    apiFetch<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  requestMagicLink: (body: { email: string; organizationSlug: string }) =>
    apiFetch<{
      sent: boolean;
      demo?: boolean;
      message: string;
      verifyUrl?: string;
    }>("/api/v1/auth/magic-link/request", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  verifyMagicLink: (token: string) =>
    apiFetch<LoginResponse>("/api/v1/auth/magic-link/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
      auth: false,
    }),

  logout: (refreshToken?: string) =>
    apiFetch<{ ok: boolean }>("/api/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      auth: false,
    }),

  editionFeatures: () =>
    apiFetch<{
      edition: "community" | "enterprise";
      deploymentEdition: "community" | "enterprise";
      licensed: boolean;
      features: Record<
        "sso" | "compliance_export" | "multi_org" | "rbac_overrides",
        boolean
      >;
    }>("/api/v1/editions/features"),

  authMemberships: () =>
    apiFetch<{
      email: string;
      activeOrganizationId: string;
      memberships: Array<{
        userId: string;
        role: string;
        isActive: boolean;
        organization: { id: string; name: string; slug: string; plan: string };
      }>;
    }>("/api/v1/auth/memberships"),

  switchOrganization: (organizationSlug: string) =>
    apiFetch<LoginResponse>("/api/v1/auth/switch-org", {
      method: "POST",
      body: JSON.stringify({ organizationSlug }),
    }),

  ssoStatus: (organizationSlug: string) =>
    apiFetch<{ enabled: boolean; provider: string }>(
      `/api/v1/auth/sso/status/${encodeURIComponent(organizationSlug)}`,
      { auth: false }
    ),

  ssoExchange: (organizationSlug: string, accessToken: string) =>
    apiFetch<LoginResponse>("/api/v1/auth/sso/exchange", {
      method: "POST",
      body: JSON.stringify({ organizationSlug, accessToken }),
      auth: false,
    }),

  getSsoConfig: () =>
    apiFetch<{
      provider: string;
      enabled: boolean;
      issuerUrl: string | null;
      jwksUri: string | null;
      audience: string | null;
      allowedEmailDomains: string[];
    }>("/api/v1/auth/sso/config"),

  updateSsoConfig: (body: {
    provider?: string;
    enabled?: boolean;
    issuerUrl?: string;
    jwksUri?: string;
    audience?: string;
    allowedEmailDomains?: string[];
  }) =>
    apiFetch("/api/v1/auth/sso/config", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getInstanceSettings: () =>
    apiFetch<{ settings: InstanceSettingItem[]; status: InstanceStatus }>(
      "/api/v1/instance-settings"
    ),

  updateInstanceSettings: (values: Record<string, string | null>) =>
    apiFetch<{ updated: string[]; settings: InstanceSettingItem[] }>(
      "/api/v1/instance-settings",
      {
        method: "PUT",
        body: JSON.stringify({ values }),
      }
    ),

  sendInstanceTestEmail: (to?: string) =>
    apiFetch<{ sent: boolean; status?: number; error?: string }>(
      "/api/v1/instance-settings/test-email",
      {
        method: "POST",
        body: JSON.stringify(to ? { to } : {}),
      }
    ),

  revokeAllSessions: () =>
    apiFetch<{ ok: boolean; revokedSessions: number; invalidatedLinks: number }>(
      "/api/v1/auth/sessions/revoke-all",
      { method: "POST" }
    ),

  getRbacMatrix: () =>
    apiFetch<{
      permissions: string[];
      roles: string[];
      matrix: Record<string, Record<string, boolean>>;
      hasOverrides: boolean;
    }>("/api/v1/rbac/permissions"),

  myPermissions: () =>
    apiFetch<{
      role: string;
      permissions: Record<string, boolean>;
    }>("/api/v1/rbac/me"),

  updateRbacPermission: (body: {
    role: string;
    permission: string;
    allowed: boolean;
  }) =>
    apiFetch("/api/v1/rbac/permissions", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  resetRbacRole: (role: string) =>
    apiFetch(`/api/v1/rbac/permissions/reset/${encodeURIComponent(role)}`, {
      method: "POST",
    }),

  getMe: () =>
    apiFetch<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      organizationId: string;
      organization: { id: string; name: string; slug: string; plan: string };
    }>("/api/v1/users/me"),

  listUsers: () => apiFetch<OrgMember[]>("/api/v1/users"),

  updateUserRole: (id: string, role: string) =>
    apiFetch<OrgMember>(`/api/v1/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  deleteUser: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/api/v1/users/${id}`, { method: "DELETE" }),

  inviteUser: (organizationId: string, body: { email: string; name?: string; role?: string }) =>
    apiFetch<OrgMember>(`/api/v1/organizations/${organizationId}/invites`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  dashboard: (range = "mtd") =>
    apiFetch<{
      period: string;
      totalSpend: number;
      monthlyBudget: number | null;
      budgetUtilization: number | null;
      activeUsers: number;
      activeTeams: number;
      connectedProviders: number;
      totalRequests: number;
      byProvider: { provider: string; cost: number; requests: number }[];
      topTeams: { teamId: string | null; name: string; cost: number; requests: number }[];
      topModels: { model: string; provider: string; cost: number; share: number; requests: number }[];
      dailySpend: { date: string; spend: number; requests: number }[];
    }>(`/api/v1/dashboard?range=${range}`),

  analyticsModels: (range = "mtd") =>
    apiFetch<
      { model: string; provider: string; cost: number; share: number; requests: number }[]
    >(`/api/v1/analytics/models?range=${range}`),

  analyticsTeams: (range = "mtd") =>
    apiFetch<
      {
        teamId: string | null;
        name: string;
        members: number;
        cost: number;
        budget: number | null;
        utilization: number | null;
        requests: number;
      }[]
    >(`/api/v1/analytics/teams?range=${range}`),

  analyticsUsers: (range = "mtd") =>
    apiFetch<
      {
        userId: string | null;
        name: string | null;
        email: string | null;
        team: string | null;
        cost: number;
        requests: number;
        tokens: number;
      }[]
    >(`/api/v1/analytics/users?range=${range}`),

  analyticsProviders: (range = "mtd") =>
    apiFetch<
      {
        provider: string;
        cost: number;
        requests: number;
        inputTokens: number;
        outputTokens: number;
      }[]
    >(`/api/v1/analytics/providers?range=${range}`),

  getTeam: (id: string) =>
    apiFetch<{
      id: string;
      name: string;
      members: {
        userId: string;
        user: { id: string; email: string; name: string | null };
      }[];
      _count: { usageEvents: number };
    }>(`/api/v1/teams/${id}`),

  getProvider: (id: string) =>
    apiFetch<{
      id: string;
      name: string;
      displayName: string;
      authType?: "API_KEY" | "OAUTH";
      dataSource?: "SAMPLE" | "LIVE";
      status: string;
      lastSyncAt: string | null;
      lastSyncError: string | null;
      createdAt: string;
      updatedAt: string;
    }>(`/api/v1/providers/${id}`),

  getUserProfile: (id: string, range = "mtd") =>
    apiFetch<{
      id: string;
      email: string;
      name: string | null;
      role: string;
      team: string | null;
      cost: number;
      requests: number;
      tokens: number;
    }>(`/api/v1/users/${id}?range=${range}`),

  seedDemo: () =>
    apiFetch<{ seeded: boolean; eventsCreated?: number }>("/api/v1/dashboard/seed-demo", {
      method: "POST",
    }),

  listTeams: () =>
    apiFetch<{ id: string; name: string; _count: { members: number } }[]>("/api/v1/teams"),

  createTeam: (name: string) =>
    apiFetch<{ id: string; name: string }>("/api/v1/teams", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  listAuditLogs: (params?: { cursor?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.cursor) q.set("cursor", params.cursor);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return apiFetch<{
      items: {
        id: string;
        action: string;
        resource: string;
        resourceId: string | null;
        createdAt: string;
        metadata: unknown;
        actor: { id: string; email: string; name: string | null } | null;
      }[];
      hasMore: boolean;
      nextCursor: string | null;
    }>(`/api/v1/audit-logs${qs ? `?${qs}` : ""}`);
  },

  listProviders: () =>
    apiFetch<
      {
        id: string;
        name: string;
        displayName: string;
        authType?: "API_KEY" | "OAUTH";
        dataSource?: "SAMPLE" | "LIVE";
        status: string;
        lastSyncAt: string | null;
        lastSyncError: string | null;
      }[]
    >("/api/v1/providers"),

  syncHealth: () =>
    apiFetch<{
      overall: "healthy" | "degraded" | "error" | "empty";
      providerCount: number;
      errorCount: number;
      staleCount: number;
      lastCheckedAt: string;
      providers: {
        id: string;
        name: string;
        displayName: string;
        status: string;
        lastSyncAt: string | null;
        lastSyncError: string | null;
        eventsLast24h: number;
      }[];
    }>("/api/v1/providers/sync-health"),

  connectProvider: (body: {
    name:
      | "OPENAI"
      | "ANTHROPIC"
      | "GEMINI"
      | "AZURE_OPENAI"
      | "BEDROCK";
    apiKey: string;
    externalOrganizationId?: string;
  }) =>
    apiFetch("/api/v1/providers/connect", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  startProviderOAuth: (
    provider: "OPENAI" | "ANTHROPIC" | "GEMINI",
    origin?: string
  ) =>
    apiFetch<{
      oauthAvailable: boolean;
      preferred?: boolean;
      provider: string;
      mock?: boolean;
      state?: string;
      authorizationUrl?: string;
      message?: string;
    }>(
      `/api/v1/providers/oauth/${provider}/start${origin ? `?origin=${encodeURIComponent(origin)}` : ""}`
    ),

  completeProviderOAuth: (
    provider: "OPENAI" | "ANTHROPIC" | "GEMINI",
    body: { code: string; state: string }
  ) =>
    apiFetch(`/api/v1/providers/oauth/${provider}/callback`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  integrationsCatalog: () =>
    apiFetch<{
      strategy: string;
      integrations: {
        id: string;
        name: string;
        preferredAuth: string;
        supportedAuth: string[];
        oauthAvailable: boolean;
        description: string;
      }[];
    }>("/api/v1/integrations/catalog", { auth: false }),

  syncProvider: (id: string) =>
    apiFetch<{ synced: boolean; eventsInserted: number }>(
      `/api/v1/providers/${id}/sync`,
      { method: "POST" }
    ),

  deleteProvider: (id: string) =>
    apiFetch(`/api/v1/providers/${id}`, { method: "DELETE" }),

  listUsage: (params?: {
    provider?: string;
    teamId?: string;
    from?: string;
    to?: string;
    limit?: number;
    cursor?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.provider) q.set("provider", params.provider);
    if (params?.teamId) q.set("teamId", params.teamId);
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.cursor) q.set("cursor", params.cursor);
    const qs = q.toString();
    return apiFetch<{
      events: {
        id: string;
        timestamp: string;
        provider: string;
        model: string;
        user: { name: string | null; email: string } | null;
        team: { name: string } | null;
        inputTokens: number;
        outputTokens: number;
        cost: number;
      }[];
      summary: {
        count: number;
        totalCost: number;
        inputTokens: number;
        outputTokens: number;
      };
      hasMore: boolean;
      nextCursor: string | null;
    }>(`/api/v1/usage${qs ? `?${qs}` : ""}`);
  },

  listBudgets: () =>
    apiFetch<
      {
        id: string;
        name: string;
        scope: "ORGANIZATION" | "TEAM";
        teamId: string | null;
        teamName: string | null;
        monthlyLimit: number;
        spent: number;
        utilization: number;
        period: string;
      }[]
    >("/api/v1/budgets"),

  budgetBurnRate: () =>
    apiFetch<{ spent: number; dailyBurn: number; days: number }>(
      "/api/v1/budgets/burn-rate"
    ),

  createBudget: (body: {
    name: string;
    scope: "ORGANIZATION" | "TEAM";
    teamId?: string;
    monthlyLimit: number;
  }) =>
    apiFetch("/api/v1/budgets", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateBudget: (
    id: string,
    body: { name?: string; monthlyLimit?: number }
  ) =>
    apiFetch(`/api/v1/budgets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteBudget: (id: string) =>
    apiFetch(`/api/v1/budgets/${id}`, { method: "DELETE" }),

  listCostCenters: () =>
    apiFetch<
      {
        id: string;
        code: string;
        name: string;
        description: string | null;
        teamId: string | null;
        teamName: string | null;
        monthToDateSpend: number;
        createdAt: string;
      }[]
    >("/api/v1/cost-centers"),

  createCostCenter: (body: {
    code: string;
    name: string;
    description?: string;
    teamId?: string;
  }) =>
    apiFetch("/api/v1/cost-centers", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateCostCenter: (
    id: string,
    body: { name?: string; description?: string; teamId?: string | null }
  ) =>
    apiFetch(`/api/v1/cost-centers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteCostCenter: (id: string) =>
    apiFetch(`/api/v1/cost-centers/${id}`, { method: "DELETE" }),

  chargebackReport: (days = 30) =>
    apiFetch<{
      periodDays: number;
      since: string;
      generatedAt: string;
      totalSpend: number;
      taggedSpend: number;
      untaggedSpend: number;
      untagged: {
        eventCount: number;
        inputTokens: number;
        outputTokens: number;
        spend: number;
      };
      costCenters: {
        code: string;
        name: string;
        teamName: string | null;
        eventCount: number;
        inputTokens: number;
        outputTokens: number;
        spend: number;
      }[];
    }>(`/api/v1/cost-centers/chargeback-report?days=${days}`),

  emailChargebackReport: (days = 30) =>
    apiFetch<{
      sent: boolean;
      demo?: boolean;
      message: string;
      csv?: string;
    }>(`/api/v1/cost-centers/chargeback-report/email?days=${days}`, {
      method: "POST",
    }),

  listAlerts: (unreadOnly?: boolean) =>
    apiFetch<
      {
        id: string;
        type: "BUDGET_THRESHOLD" | "SPEND_SPIKE" | "PROVIDER_SPIKE";
        severity: "WARNING" | "CRITICAL";
        title: string;
        message: string;
        read: boolean;
        createdAt: string;
      }[]
    >(`/api/v1/alerts${unreadOnly ? "?unread=true" : ""}`),

  markAlertRead: (id: string) =>
    apiFetch(`/api/v1/alerts/${id}/read`, { method: "PATCH" }),

  markAllAlertsRead: () =>
    apiFetch("/api/v1/alerts/read-all", { method: "POST" }),

  getAlertSettings: () =>
    apiFetch<{
      id: string | null;
      emailEnabled: boolean;
      slackWebhook: string | null;
      budgetThresholdPercent: number;
      emailDeliveryConfigured: boolean;
      lastEmailDeliveryAt: string | null;
      lastEmailDeliveryStatus: string | null;
      lastEmailDeliveryError: string | null;
      lastSlackDeliveryAt: string | null;
      lastSlackDeliveryStatus: string | null;
      lastSlackDeliveryError: string | null;
    }>("/api/v1/alerts/settings"),

  updateAlertSettings: (body: {
    emailEnabled?: boolean;
    slackWebhook?: string;
    budgetThresholdPercent?: number;
  }) =>
    apiFetch("/api/v1/alerts/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  testSlack: () =>
    apiFetch<{ sent: boolean; demo?: boolean; error?: string }>(
      "/api/v1/alerts/settings/test-slack",
      { method: "POST" }
    ),

  evaluateAlerts: () =>
    apiFetch<{ organizationId: string; alertsCreated: number }>(
      "/api/v1/alerts/evaluate",
      { method: "POST" }
    ),

  listGatewayKeys: () =>
    apiFetch<
      {
        id: string;
        name: string;
        keyPrefix: string;
        enabled: boolean;
        rateLimitRpm: number;
        lastUsedAt: string | null;
        createdAt: string;
      }[]
    >("/api/v1/gateway/keys"),

  createGatewayKey: (name: string) =>
    apiFetch<{
      id: string;
      name: string;
      keyPrefix: string;
      key: string;
    }>("/api/v1/gateway/keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  revokeGatewayKey: (id: string) =>
    apiFetch(`/api/v1/gateway/keys/${id}`, { method: "DELETE" }),

  gatewayStatus: () =>
    apiFetch<{
      enabled: boolean;
      activeKeys: number;
      endpoints: {
        unified: string;
        openai: string;
        anthropic: string;
        gemini: string;
      };
      unifiedRouting: boolean;
      intelligentRouting: boolean;
      streaming: boolean;
      rateLimitPerKey: string;
    }>("/api/v1/gateway/status"),

  getGatewayRouting: () =>
    apiFetch<{
      intelligentRouting: boolean;
      customMappings: Record<string, { provider: string; model: string }>;
    }>("/api/v1/gateway/routing"),

  setGatewayRouting: (body: {
    intelligentRouting?: boolean;
    customMappings?: Record<string, { provider: string; model: string }>;
  }) =>
    apiFetch("/api/v1/gateway/routing", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  listAgents: () =>
    apiFetch<
      {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        teamId: string | null;
        team: { id: string; name: string } | null;
        monthlyBudget: number | null;
        spent: number;
        utilization: number | null;
        enabled: boolean;
        createdAt: string;
      }[]
    >("/api/v1/agents"),

  createAgent: (body: {
    name: string;
    slug?: string;
    description?: string;
    teamId?: string;
    monthlyBudget?: number;
  }) =>
    apiFetch("/api/v1/agents", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateAgent: (
    id: string,
    body: {
      name?: string;
      description?: string;
      monthlyBudget?: number | null;
      enabled?: boolean;
    }
  ) =>
    apiFetch(`/api/v1/agents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteAgent: (id: string) =>
    apiFetch(`/api/v1/agents/${id}`, { method: "DELETE" }),

  listLicenses: () =>
    apiFetch<
      {
        id: string;
        vendor: string;
        planName: string;
        seats: number | null;
        monthlyCost: number | null;
        renewsAt: string | null;
        notes: string | null;
        createdAt: string;
      }[]
    >("/api/v1/licenses"),

  createLicense: (body: {
    vendor: string;
    planName: string;
    seats?: number;
    monthlyCost?: number;
    renewsAt?: string;
    notes?: string;
  }) =>
    apiFetch("/api/v1/licenses", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateLicense: (
    id: string,
    body: {
      vendor?: string;
      planName?: string;
      seats?: number | null;
      monthlyCost?: number | null;
      renewsAt?: string | null;
      notes?: string | null;
    }
  ) =>
    apiFetch(`/api/v1/licenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteLicense: (id: string) =>
    apiFetch(`/api/v1/licenses/${id}`, { method: "DELETE" }),

  listPolicies: () =>
    apiFetch<
      {
        id: string;
        name: string;
        type: string;
        scope: string;
        enabled: boolean;
        config: { models?: string[] };
        team?: { name: string } | null;
      }[]
    >("/api/v1/policies"),

  getEnforcement: () =>
    apiFetch<{ budgetEnforcement: "MONITORING" | "HARD_CAP" }>(
      "/api/v1/policies/enforcement"
    ),

  setEnforcement: (budgetEnforcement: "MONITORING" | "HARD_CAP") =>
    apiFetch("/api/v1/policies/enforcement", {
      method: "PATCH",
      body: JSON.stringify({ budgetEnforcement }),
    }),

  createPolicy: (body: {
    name: string;
    type: "MODEL_ALLOW_LIST" | "MODEL_DENY_LIST" | "BUDGET_HARD_CAP";
    config: { models?: string[] };
  }) =>
    apiFetch("/api/v1/policies", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updatePolicy: (
    id: string,
    body: {
      name?: string;
      enabled?: boolean;
      config?: { models?: string[] };
    }
  ) =>
    apiFetch(`/api/v1/policies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deletePolicy: (id: string) =>
    apiFetch(`/api/v1/policies/${id}`, { method: "DELETE" }),

  exportPoliciesYaml: () =>
    apiFetch<{ yaml: string; ruleCount: number }>(
      "/api/v1/policies/export/yaml"
    ),

  importPoliciesYaml: (yaml: string, mode: "append" | "replace" = "append") =>
    apiFetch<{
      imported: number;
      mode: string;
      errors: string[];
    }>("/api/v1/policies/import/yaml", {
      method: "POST",
      body: JSON.stringify({ yaml, mode }),
    }),

  exportComplianceBundle: (days = 30) =>
    apiFetch<{
      generatedAt: string;
      organization: string;
      periodDays: number;
      files: { filename: string; content: string }[];
    }>(`/api/v1/compliance/export?days=${days}`),

  optimizationInsights: () =>
    apiFetch<
      {
        id: string;
        type: string;
        severity: string;
        title: string;
        description: string;
        estimatedMonthlySavings: number;
        actionLabel: string;
        actionHref: string;
        applyable?: boolean;
        denyModel?: string;
        suggestModel?: string;
      }[]
    >("/api/v1/insights/optimization"),

  applyOptimizationInsight: (id: string) =>
    apiFetch<{
      applied: boolean;
      message: string;
      policy: { id: string; name: string };
    }>(`/api/v1/insights/optimization/${encodeURIComponent(id)}/apply`, {
      method: "POST",
    }),

  anomalies: () =>
    apiFetch<
      {
        id: string;
        type: string;
        severity: string;
        title: string;
        description: string;
        metric: string;
        value: number;
        baseline: number;
        zScore?: number;
        detectedAt: string;
        actionLabel: string;
        actionHref: string;
      }[]
    >("/api/v1/insights/anomalies"),

  simulationModels: () =>
    apiFetch<
      {
        model: string;
        provider: string;
        cost30d: number;
        requests: number;
        suggestedAlternative: string | null;
      }[]
    >("/api/v1/insights/simulate/models"),

  simulateCost: (body: {
    swaps: { fromModel: string; toModel: string }[];
    volumeChangePercent?: number;
  }) =>
    apiFetch<{
      periodDays: number;
      currentMonthlyProjected: number;
      projectedMonthly: number;
      monthlySavings: number;
      savingsPercent: number;
      breakdown: {
        fromModel: string;
        toModel: string;
        provider: string;
        currentCost: number;
        projectedCost: number;
        savings: number;
        requests: number;
      }[];
    }>("/api/v1/insights/simulate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateGatewayKeyRateLimit: (id: string, rateLimitRpm: number) =>
    apiFetch<{
      id: string;
      name: string;
      keyPrefix: string;
      rateLimitRpm: number;
    }>(`/api/v1/gateway/keys/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ rateLimitRpm }),
    }),
};
