"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { CheckCircle2, Plug, RefreshCw, Unplug, XCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  CONNECTABLE_PROVIDERS,
  type ConnectableProviderName,
  PROVIDER_HINTS,
  PROVIDER_LABELS,
  providerSupportsOAuth,
} from "@/lib/provider-types";
import { providers as mockProviders } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/format";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { markStepComplete } from "@/lib/getting-started";
import { canManageProviders } from "@/lib/permissions";
import { PageHeader } from "@/components/page-header";
import { LabelWithHelp } from "@/components/help-tip";
import { PAGE_META } from "@/lib/page-meta";
import { EmptyState, SyncHealthBanner } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const providerMeta: Record<string, { color: string; description: string }> = {
  OPENAI: {
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    description: "GPT-4o, o3, embeddings, and usage APIs",
  },
  openai: {
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    description: "GPT-4o, o3, embeddings, and usage APIs",
  },
  ANTHROPIC: {
    color: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    description: "Claude Sonnet, Opus, Haiku via Admin API",
  },
  anthropic: {
    color: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    description: "Claude Sonnet, Opus, Haiku via Admin API",
  },
  GEMINI: {
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    description: "Gemini Pro, Flash via Google Cloud billing",
  },
  gemini: {
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    description: "Gemini Pro, Flash via Google Cloud billing",
  },
  AZURE_OPENAI: {
    color: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    description: PROVIDER_HINTS.AZURE_OPENAI,
  },
  azure_openai: {
    color: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    description: PROVIDER_HINTS.AZURE_OPENAI,
  },
  BEDROCK: {
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    description: PROVIDER_HINTS.BEDROCK,
  },
  bedrock: {
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    description: PROVIDER_HINTS.BEDROCK,
  },
};

type ProviderRow = {
  id: string;
  name: string;
  displayName: string;
  status: string;
  dataSource?: "SAMPLE" | "LIVE";
  authType?: "API_KEY" | "OAUTH";
  lastSyncAt: string | null;
  lastSyncError: string | null;
  monthlySpend?: number;
  requests?: number;
  tokens?: number;
  lastSync?: string;
};

function DataSourceBadge({ source }: { source?: "SAMPLE" | "LIVE" }) {
  if (!source) return null;
  if (source === "SAMPLE") {
    return (
      <Badge variant="secondary" className="w-fit text-xs">
        Sample data
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="w-fit border-primary/30 text-xs text-primary">
      Live sync
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "connected")
    return (
      <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3" />
        Connected
      </Badge>
    );
  if (s === "syncing")
    return (
      <Badge variant="outline" className="gap-1">
        <RefreshCw className="size-3 animate-spin" />
        Syncing
      </Badge>
    );
  return (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="size-3" />
      Error
    </Badge>
  );
}

export default function ProvidersPage() {
  const { apiMode, session } = useAuth();
  const role = session?.user.role ?? "VIEWER";
  const canManage = canManageProviders(role);
  const [rows, setRows] = useState<ProviderRow[]>([]);
  const [connectName, setConnectName] =
    useState<ConnectableProviderName>("OPENAI");
  const [apiKey, setApiKey] = useState("sk-demo-test-key");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<ProviderRow | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncHealth, setSyncHealth] = useState<
    Awaited<ReturnType<typeof api.syncHealth>> | null
  >(null);

  const load = useCallback(async () => {
    if (!apiMode) {
      setRows(
        mockProviders.map((p) => ({
          id: p.id,
          name: p.name.toUpperCase(),
          displayName: p.displayName,
          status: p.status,
          lastSyncAt: null,
          lastSyncError: null,
          monthlySpend: p.monthlySpend,
          requests: p.requests,
          tokens: p.tokens,
          lastSync: p.lastSync,
        }))
      );
      return;
    }
    const [list, health] = await Promise.all([
      api.listProviders(),
      api.syncHealth(),
    ]);
    setRows(list);
    setSyncHealth(health);
  }, [apiMode]);

  const showApiKeyPanel =
    showApiKey || !providerSupportsOAuth(connectName);

  useLoadEffect(load, [load]);

  async function handleOAuthConnect() {
    if (!apiMode || !providerSupportsOAuth(connectName)) return;
    setOauthLoading(true);
    setError("");
    try {
      const res = await api.startProviderOAuth(
        connectName,
        typeof window !== "undefined" ? window.location.origin : undefined
      );
      if (!res.oauthAvailable || !res.authorizationUrl) {
        setError(res.message ?? "OAuth not available — use API key instead.");
        setShowApiKey(true);
        return;
      }
      window.location.href = res.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth connect failed");
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleConnect() {
    if (!apiMode) return;
    setLoading(true);
    setError("");
    try {
      await api.connectProvider({ name: connectName, apiKey });
      track("provider_connected", { provider: connectName });
      markStepComplete("provider");
      setOpen(false);
      setApiKey("sk-demo-test-key");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(id: string) {
    if (!apiMode) return;
    setSyncingId(id);
    try {
      await api.syncProvider(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncingId(null);
    }
  }

  async function handleDisconnect() {
    if (!disconnectTarget || !apiMode) return;
    setDisconnecting(true);
    try {
      await api.deleteProvider(disconnectTarget.id);
      setDisconnectTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={PAGE_META["/providers"].title}
        description={PAGE_META["/providers"].description}
        help="Connect AI vendors with OAuth (recommended) or an API key. Your team keeps using existing tools."
        docHref={PAGE_META["/providers"].docHref}
      >
        {canManage && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={buttonVariants()}>Connect provider</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect provider</DialogTitle>
              <DialogDescription>
                OAuth is recommended — revocable access without copying secrets.
                API keys remain available for automation and vendors without OAuth.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={connectName}
                  onValueChange={(v) =>
                    v && setConnectName(v as typeof connectName)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONNECTABLE_PROVIDERS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PROVIDER_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {providerSupportsOAuth(connectName) ? (
                <>
                  <Button
                    className="w-full"
                    onClick={handleOAuthConnect}
                    disabled={oauthLoading || loading || !apiMode}
                  >
                    {oauthLoading ? "Redirecting…" : "Connect with OAuth"}
                  </Button>
                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wide text-muted-foreground">
                      <span className="bg-background px-2">or</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  {PROVIDER_LABELS[connectName]} uses API key connect only today.
                  Native billing sync is on the roadmap — use{" "}
                  <code className="text-foreground">sk-demo-test-key</code> for
                  sample data or route traffic through the Gateway.
                </p>
              )}
              {!showApiKeyPanel ? (
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => setShowApiKey(true)}
                >
                  Use API key instead
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <LabelWithHelp
                      htmlFor="api-key"
                      label="API key"
                      help="Stored encrypted. Use sk-demo-test-key for sample data without a real vendor account."
                    />
                    <Input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={handleConnect}
                    disabled={loading || oauthLoading || !apiMode}
                  >
                    {loading ? "Connecting…" : "Connect with API key"}
                  </Button>
                </>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </DialogContent>
        </Dialog>
        )}
      </PageHeader>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <ConfirmDialog
        open={!!disconnectTarget}
        onOpenChange={(v) => !v && setDisconnectTarget(null)}
        title="Disconnect provider?"
        description={`Disconnect ${disconnectTarget?.displayName ?? "this provider"}? Historical usage data is kept, but sync will stop.`}
        confirmLabel="Disconnect"
        loading={disconnecting}
        onConfirm={handleDisconnect}
      />

      {apiMode && syncHealth && syncHealth.overall !== "empty" && (
        <SyncHealthBanner
          overall={syncHealth.overall}
          providerCount={syncHealth.providerCount}
          errorCount={syncHealth.errorCount}
          staleCount={syncHealth.staleCount}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {rows.map((provider) => {
          const meta =
            providerMeta[provider.name] ?? providerMeta[provider.name.toLowerCase()] ?? {
              color: "bg-muted",
              description: "",
            };
          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Link
                    href={`/providers/${provider.id}`}
                    className={`rounded-lg px-2.5 py-1 text-sm font-semibold hover:opacity-80 ${meta.color}`}
                  >
                    {provider.displayName}
                  </Link>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={provider.status} />
                  {apiMode && <DataSourceBadge source={provider.dataSource} />}
                </div>
                </div>
                <CardDescription className="mt-2">{meta.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!apiMode && provider.monthlySpend !== undefined && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Monthly spend</p>
                      <p className="font-mono font-medium">
                        {formatCurrency(provider.monthlySpend)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Requests</p>
                      <p className="font-mono font-medium">
                        {formatNumber(provider.requests ?? 0)}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {provider.lastSyncAt
                    ? `Last synced ${new Date(provider.lastSyncAt).toLocaleString()}`
                    : provider.lastSync ?? "Not synced yet"}
                </p>
                {provider.lastSyncError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2">
                    <p className="text-xs text-destructive">{provider.lastSyncError}</p>
                    {canManage && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-1 h-auto p-0 text-xs"
                        onClick={() => handleSync(provider.id)}
                        disabled={syncingId === provider.id}
                      >
                        {syncingId === provider.id ? "Retrying…" : "Retry sync"}
                      </Button>
                    )}
                  </div>
                )}
                {canManage && (
                <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleSync(provider.id)}
                  disabled={!apiMode || syncingId === provider.id}
                >
                  {syncingId === provider.id ? (
                    <>
                      <RefreshCw className="mr-1 size-3 animate-spin" />
                      Syncing…
                    </>
                  ) : (
                    "Sync now"
                  )}
                </Button>
                {apiMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisconnectTarget(provider)}
                  >
                    <Unplug className="size-4" />
                  </Button>
                )}
                </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rows.length === 0 && (
        <EmptyState
          icon={Plug}
          title="No providers connected"
          description="Connect OpenAI, Anthropic, or Gemini to pull usage and cost data. Demo keys starting with sk-demo- work instantly."
          actionLabel={canManage ? "Connect provider" : undefined}
          onAction={canManage ? () => setOpen(true) : undefined}
          secondaryLabel="Quickstart guide"
          secondaryHref="/help"
        />
      )}
    </div>
  );
}
