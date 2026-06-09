"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Copy,
  Plus,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SettingsNav } from "@/components/settings-nav";
import { api } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { costCenters as mockCostCenters } from "@/lib/mock-data";
import { useLoadEffect } from "@/hooks/use-load-effect";

type CostCenter = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  teamName: string | null;
  monthToDateSpend: number;
};

function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function CostCentersSettingsPage() {
  const { apiMode, session } = useAuth();
  const { toast, toastError } = useToast();
  const role = session?.user.role ?? "VIEWER";
  const canManage = hasPermission(role, "cost_centers:manage");

  const [centers, setCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const displayCenters = apiMode ? centers : mockCostCenters;

  const load = useCallback(async () => {
    if (!apiMode) return;
    setLoading(true);
    try {
      setCenters(await api.listCostCenters());
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to load cost centers");
    } finally {
      setLoading(false);
    }
  }, [apiMode, toastError]);

  useLoadEffect(load, [load]);

  const totalMtd = useMemo(
    () => displayCenters.reduce((s, c) => s + c.monthToDateSpend, 0),
    [displayCenters]
  );
  const maxSpend = useMemo(
    () => Math.max(...displayCenters.map((c) => c.monthToDateSpend), 1),
    [displayCenters]
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createCostCenter({
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast("Cost center created", "success");
      setOpen(false);
      setCode("");
      setName("");
      setDescription("");
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete cost center ${label}?`)) return;
    try {
      await api.deleteCostCenter(id);
      toast("Cost center deleted", "success");
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function copyCode(codeStr: string) {
    void navigator.clipboard.writeText(codeStr);
    toast("Code copied", "success");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost centers"
        description="Allocation codes for gateway chargeback — tag requests so spend rolls up by project or department."
      />
      <SettingsNav />

      {!apiMode && (
        <Callout variant="tip" title="Demo data">
          Showing sample cost centers. Enable API mode to create and sync live codes from gateway traffic.
        </Callout>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active codes</p>
          <p className="mt-2 font-display text-3xl tabular-nums">{displayCenters.length}</p>
        </div>
        <div className="surface-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">MTD attributed spend</p>
          <p className="mt-2 font-display text-3xl tabular-nums">{formatUsd(totalMtd)}</p>
        </div>
        <div className="surface-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Header to send</p>
          <p className="mt-2 font-mono text-sm">X-Covalynce-Project-Tag</p>
        </div>
      </div>

      <div className="surface-panel overflow-hidden">
        <div className="grid gap-6 border-b border-border p-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-base font-semibold">How tagging works</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Each gateway request can include your cost center code. Covalynce attributes token spend to that code for chargeback reports.
            </p>
            <Link
              href="/help/features/gateway-attribution"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Attribution guide
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/20 p-4 font-mono text-xs leading-relaxed">
            <p className="text-muted-foreground"># OpenAI SDK example</p>
            <p className="mt-2 text-foreground">
              default_headers={"{"}
              <br />
              {"  "}&quot;X-Covalynce-Project-Tag&quot;: &quot;ENG-PLATFORM&quot;,
              <br />
              {"}"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Allocation codes</h2>
            <p className="text-sm text-muted-foreground">
              Spend shown is month-to-date from tagged gateway events.
            </p>
          </div>
          {apiMode && canManage && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground">
                <Plus className="size-4" />
                Add cost center
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New cost center</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cc-code">Code</Label>
                    <Input
                      id="cc-code"
                      placeholder="ENG-PLATFORM"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Use in X-Covalynce-Project-Tag</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cc-name">Name</Label>
                    <Input
                      id="cc-name"
                      placeholder="Platform engineering"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cc-desc">Description (optional)</Label>
                    <Input
                      id="cc-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading && apiMode && centers.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted-foreground">Loading…</p>
        ) : displayCenters.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted/30">
              <Tag className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium">No cost centers yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create a code, then send it on gateway requests. Spend appears here after traffic is tagged.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {displayCenters.map((c) => {
              const share = (c.monthToDateSpend / maxSpend) * 100;
              const pctOfTotal = totalMtd > 0 ? (c.monthToDateSpend / totalMtd) * 100 : 0;
              return (
                <li
                  key={c.id}
                  className="grid gap-4 px-5 py-4 transition-colors hover:bg-muted/20 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs font-semibold">
                        {c.code}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => copyCode(c.code)}
                        aria-label={`Copy ${c.code}`}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    </div>
                    <p className="mt-1 font-medium">{c.name}</p>
                    {c.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>
                    )}
                    {c.teamName && (
                      <p className="mt-1 text-xs text-muted-foreground">Team · {c.teamName}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium tabular-nums">{formatUsd(c.monthToDateSpend)}</span>
                      <span className="text-muted-foreground">{pctOfTotal.toFixed(0)}% of total</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="size-3.5" />
                      MTD
                    </span>
                    {apiMode && canManage && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(c.id, c.code)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Export a chargeback CSV from{" "}
        <Link href="/reports" className="font-medium text-foreground hover:underline">
          Reports
        </Link>{" "}
        when API mode is enabled.
      </p>
    </div>
  );
}
