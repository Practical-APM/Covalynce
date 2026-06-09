"use client";

import { useCallback, useState } from "react";
import { Copy, Key } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Callout } from "@/components/callout";
import { EmptyState } from "@/components/empty-state";
import { GatewayIntegrationPanel } from "@/components/gateway-integration-panel";
import { PageHeader } from "@/components/page-header";
import { PAGE_META } from "@/lib/page-meta";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { isAdmin } from "@/lib/permissions";

const meta = PAGE_META["/gateway"];

export default function GatewayPage() {
  const { apiMode, session } = useAuth();
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const [keys, setKeys] = useState<
    Awaited<ReturnType<typeof api.listGatewayKeys>>
  >([]);
  const [status, setStatus] = useState<
    Awaited<ReturnType<typeof api.gatewayStatus>> | null
  >(null);
  const [newKeyName, setNewKeyName] = useState("Production app");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingRpm, setEditingRpm] = useState<string | null>(null);
  const [rpmValue, setRpmValue] = useState("120");
  const [intelligentRouting, setIntelligentRouting] = useState(false);

  const load = useCallback(async () => {
    if (!apiMode) return;
    const [k, s, routing] = await Promise.all([
      api.listGatewayKeys(),
      api.gatewayStatus(),
      api.getGatewayRouting(),
    ]);
    setKeys(k);
    setStatus(s);
    setIntelligentRouting(routing.intelligentRouting);
  }, [apiMode]);

  useLoadEffect(load, [load]);

  async function handleCreateKey() {
    const res = await api.createGatewayKey(newKeyName);
    setCreatedKey(res.key);
    setOpen(false);
    await load();
  }

  async function handleSaveRpm(id: string) {
    const rpm = parseInt(rpmValue, 10);
    if (rpm < 10 || rpm > 10000) return;
    await api.updateGatewayKeyRateLimit(id, rpm);
    setEditingRpm(null);
    await load();
  }

  async function toggleIntelligentRouting() {
    const next = !intelligentRouting;
    await api.setGatewayRouting({ intelligentRouting: next });
    setIntelligentRouting(next);
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={meta.title}
        description={meta.description}
        help={meta.help}
        docHref={meta.docHref}
      >
        {admin && apiMode && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={buttonVariants()}>
              <Key className="size-4" />
              Create gateway key
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create gateway key</DialogTitle>
                <DialogDescription>
                  Keys authenticate apps calling the OpenAI-compatible proxy
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleCreateKey}>
                  Generate key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {!apiMode && (
        <EmptyState
          icon={Key}
          title="Gateway requires live API"
          description="Sign in with API mode to create gateway keys and route LLM traffic through Covalynce."
          actionLabel="Sign in"
          actionHref="/login"
          secondaryLabel="Read the guide"
          secondaryHref="/help/features/gateway"
        />
      )}

      {apiMode && (
        <div className="surface-panel grid gap-px overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Status",
              value: status?.enabled ? "Active" : "Not configured",
              sub: `${status?.activeKeys ?? 0} active keys`,
            },
            {
              label: "Streaming",
              value: "Supported",
              sub: "OpenAI, Anthropic, Gemini",
            },
            {
              label: "Rate limit",
              value: status?.rateLimitPerKey ?? "120 / min",
              sub: "Per gateway key",
            },
            {
              label: "Unified routing",
              value: status?.unifiedRouting ? "On" : "Off",
              sub: "Single multi-provider URL",
            },
          ].map((item) => (
            <div key={item.label} className="bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-semibold">{item.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>
      )}

      {admin && apiMode && (
        <div className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Intelligent model routing</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Auto-downgrade premium models at the unified endpoint (e.g. gpt-4o
              → gpt-4o-mini).
            </p>
          </div>
          <Button
            variant={intelligentRouting ? "default" : "outline"}
            size="sm"
            onClick={toggleIntelligentRouting}
          >
            {intelligentRouting ? "Enabled" : "Disabled"}
          </Button>
        </div>
      )}

      {createdKey && (
        <Callout variant="warning" title="Save your gateway key now">
          <div className="flex flex-wrap items-center gap-2">
            <code className="max-w-full truncate rounded-md bg-muted px-2 py-1 font-mono text-xs">
              {createdKey}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(createdKey)}
            >
              <Copy className="size-4" />
              Copy
            </Button>
          </div>
        </Callout>
      )}

      {apiMode && keys.length > 0 && (
        <div className="surface-panel overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">Gateway keys</h2>
          </div>
          <div className="divide-y divide-border px-5">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0"
              >
                <div>
                  <p className="font-medium">{k.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {k.keyPrefix}…
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {admin && editingRpm === k.id ? (
                    <>
                      <Input
                        type="number"
                        min={10}
                        max={10000}
                        className="h-8 w-24"
                        value={rpmValue}
                        onChange={(e) => setRpmValue(e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveRpm(k.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingRpm(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {k.rateLimitRpm ?? 120} req/min
                      </span>
                      {admin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingRpm(k.id);
                              setRpmValue(String(k.rateLimitRpm ?? 120));
                            }}
                          >
                            Edit RPM
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              api.revokeGatewayKey(k.id).then(load)
                            }
                          >
                            Revoke
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {apiMode && <GatewayIntegrationPanel />}
    </div>
  );
}
