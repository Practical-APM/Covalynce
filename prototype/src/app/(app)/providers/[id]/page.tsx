"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCw, Unplug } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getProviderById,
  modelBreakdown as mockModels,
} from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { canManageProviders } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { useLoadEffect } from "@/hooks/use-load-effect";

function formatLastSync(iso: string | null) {
  if (!iso) return "Never";
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

export default function ProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { apiMode, session } = useAuth();
  const router = useRouter();
  const canManage = canManageProviders(session?.user.role ?? "VIEWER");
  const [loading, setLoading] = useState(apiMode);
  const [notFound, setNotFound] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [providerKey, setProviderKey] = useState("");
  const [status, setStatus] = useState("");
  const [authType, setAuthType] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"SAMPLE" | "LIVE" | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [requests, setRequests] = useState(0);
  const [models, setModels] = useState<{ model: string; cost: number }[]>([]);

  const load = useCallback(async () => {
    if (!apiMode) {
      const provider = getProviderById(id);
      if (!provider) {
        setNotFound(true);
        return;
      }
      setDisplayName(provider.displayName);
      setProviderKey(provider.name);
      setStatus(provider.status);
      setLastSyncAt(null);
      setMonthlySpend(provider.monthlySpend);
      setRequests(provider.requests);
      setModels(
        mockModels
          .filter(
            (m) =>
              m.provider.toLowerCase() === provider.displayName.toLowerCase() ||
              (provider.name === "openai" && m.provider === "OpenAI") ||
              (provider.name === "anthropic" && m.provider === "Anthropic") ||
              (provider.name === "gemini" && m.provider === "Gemini")
          )
          .map((m) => ({ model: m.model, cost: m.cost }))
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [provider, providerStats, modelStats] = await Promise.all([
        api.getProvider(id),
        api.analyticsProviders(),
        api.analyticsModels(),
      ]);
      setDisplayName(provider.displayName);
      setProviderKey(provider.name);
      setStatus(provider.status.toLowerCase());
      setAuthType(provider.authType ?? null);
      setDataSource(provider.dataSource ?? null);
      setLastSyncAt(provider.lastSyncAt);

      const stats = providerStats.find((p) => p.provider === provider.name);
      setMonthlySpend(stats?.cost ?? 0);
      setRequests(stats?.requests ?? 0);
      setModels(
        modelStats
          .filter((m) => m.provider === provider.name)
          .map((m) => ({ model: m.model, cost: m.cost }))
      );
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [apiMode, id]);

  useLoadEffect(load, [load]);

  async function handleSync() {
    if (!apiMode) return;
    setSyncing(true);
    try {
      await api.syncProvider(id);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    if (!apiMode) return;
    setDisconnecting(true);
    try {
      await api.deleteProvider(id);
      router.push("/providers");
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Provider not found.</p>
        <Link
          href="/providers"
          className="text-sm text-primary hover:underline"
        >
          Back to providers
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading provider…</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/providers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Providers
      </Link>

      <PageHeader title={displayName} description="Provider account & sync">
        {apiMode && canManage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={syncing}
              onClick={handleSync}
            >
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
              Sync now
            </Button>
            <Button
              variant="outline"
              onClick={() => setDisconnectOpen(true)}
            >
              <Unplug className="size-4" />
              Disconnect
            </Button>
          </div>
        )}
      </PageHeader>

      <ConfirmDialog
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title="Disconnect provider?"
        description={`Disconnect ${displayName}? Historical usage is kept, but sync will stop.`}
        confirmLabel="Disconnect"
        loading={disconnecting}
        onConfirm={handleDisconnect}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly spend</CardDescription>
            <CardTitle className="font-mono text-2xl">
              {formatCurrency(monthlySpend)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Requests</CardDescription>
            <CardTitle className="font-mono text-2xl">
              {formatNumber(requests)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="w-fit capitalize">{status}</Badge>
              {authType && (
                <Badge variant="outline" className="w-fit">
                  {authType === "OAUTH" ? "OAuth" : "API key"}
                </Badge>
              )}
              {dataSource && (
                <Badge variant={dataSource === "SAMPLE" ? "secondary" : "outline"} className="w-fit">
                  {dataSource === "SAMPLE" ? "Sample data" : "Live sync"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last sync{" "}
              {apiMode
                ? formatLastSync(lastSyncAt)
                : providerKey
                  ? "demo"
                  : "—"}
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Models on this provider</CardTitle>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No usage recorded for this provider yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((m) => (
                  <TableRow key={m.model}>
                    <TableCell>{m.model}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(m.cost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
