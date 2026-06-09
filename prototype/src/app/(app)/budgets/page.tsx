"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { budgets as mockBudgets, organization } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { markStepComplete } from "@/lib/getting-started";
import { usePermissions } from "@/components/permissions-provider";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { PAGE_META } from "@/lib/page-meta";
import { useLoadEffect } from "@/hooks/use-load-effect";

type BudgetRow = {
  id: string;
  name: string;
  scope: string;
  teamName?: string | null;
  limit: number;
  spent: number;
  period: string;
};

function BudgetCard({
  budget,
  canManage,
  onEdit,
  onDelete,
}: {
  budget: BudgetRow;
  canManage: boolean;
  onEdit: (budget: BudgetRow) => void;
  onDelete: (budget: BudgetRow) => void;
}) {
  const { name, scope, limit, spent, period } = budget;
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  const remaining = limit - spent;
  const burnRate = spent / Math.max(new Date().getDate(), 1);
  const daysLeft = burnRate > 0 ? Math.max(0, Math.floor(remaining / burnRate)) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription>{period}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant={
                scope === "ORGANIZATION" || scope === "organization"
                  ? "default"
                  : "secondary"
              }
            >
              {scope === "ORGANIZATION" || scope === "organization" ? "Org" : "Team"}
            </Badge>
            {canManage && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit budget"
                  onClick={() => onEdit(budget)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete budget"
                  onClick={() => onDelete(budget)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-semibold">
              {formatCurrency(spent)}
            </span>
            <span className="text-sm text-muted-foreground">
              of {formatCurrency(limit)}
            </span>
          </div>
          <Progress
            value={Math.min(pct, 100)}
            className={cn(
              "mt-3 h-2",
              pct >= 90
                ? "[&>div]:bg-amber-500"
                : pct >= 75
                  ? "[&>div]:bg-amber-400"
                  : "[&>div]:bg-emerald-600"
            )}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {pct.toFixed(0)}% used · {formatCurrency(remaining)} remaining · ~
            {daysLeft} days at current burn
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BudgetsPage() {
  const { apiMode } = useAuth();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("budgets:manage");
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [burnRate, setBurnRate] = useState<{ spent: number; dailyBurn: number } | null>(null);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<BudgetRow | null>(null);
  const [editLimit, setEditLimit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    scope: "ORGANIZATION" as "ORGANIZATION" | "TEAM",
    teamId: "",
    monthlyLimit: 10000,
  });

  const load = useCallback(async () => {
    if (!apiMode) {
      setRows(
        mockBudgets.map((b) => ({
          id: b.id,
          name: b.name,
          scope: b.scope,
          limit: b.limit,
          spent: b.spent,
          period: b.period,
        }))
      );
      setBurnRate({ spent: organization.totalSpend, dailyBurn: organization.totalSpend / 3 });
      return;
    }
    const [budgets, burn, teamList] = await Promise.all([
      api.listBudgets(),
      api.budgetBurnRate(),
      api.listTeams(),
    ]);
    setRows(
      budgets.map((b) => ({
        id: b.id,
        name: b.name,
        scope: b.scope,
        teamName: b.teamName,
        limit: b.monthlyLimit,
        spent: b.spent,
        period: "Month to date",
      }))
    );
    setBurnRate(burn);
    setTeams(teamList);
  }, [apiMode]);

  useLoadEffect(load, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!apiMode) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      await api.createBudget({
        name: form.name,
        scope: form.scope,
        teamId: form.scope === "TEAM" ? form.teamId : undefined,
        monthlyLimit: form.monthlyLimit,
      });
      track("budget_created", { name: form.name, scope: form.scope });
      markStepComplete("budget");
      setOpen(false);
      setForm({ name: "", scope: "ORGANIZATION", teamId: "", monthlyLimit: 10000 });
      await load();
    } finally {
      setLoading(false);
    }
  }

  function openEdit(budget: BudgetRow) {
    setSelected(budget);
    setEditLimit(budget.limit);
    setEditOpen(true);
  }

  function openDelete(budget: BudgetRow) {
    setSelected(budget);
    setDeleteOpen(true);
  }

  async function handleSaveEdit() {
    if (!selected || !apiMode) return;
    setLoading(true);
    try {
      await api.updateBudget(selected.id, { monthlyLimit: editLimit });
      setEditOpen(false);
      setSelected(null);
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!selected || !apiMode) return;
    setLoading(true);
    try {
      await api.deleteBudget(selected.id);
      setDeleteOpen(false);
      setSelected(null);
      await load();
    } finally {
      setLoading(false);
    }
  }

  const dailyBurn = burnRate?.dailyBurn ?? organization.totalSpend / 3;
  const mtdSpent = burnRate?.spent ?? organization.totalSpend;

  return (
    <div className="space-y-6">
      <PageHeader
        title={PAGE_META["/budgets"].title}
        description={PAGE_META["/budgets"].description}
        help={PAGE_META["/budgets"].help}
        docHref={PAGE_META["/budgets"].docHref}
      >
        {canManage && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={buttonVariants()}>
            <Plus className="size-4" />
            Create budget
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create budget</DialogTitle>
              <DialogDescription>
                Set a monthly spend limit for your org or a team.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Engineering AI budget"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select
                  value={form.scope}
                  onValueChange={(v) =>
                    setForm({ ...form, scope: v as "ORGANIZATION" | "TEAM" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORGANIZATION">Organization</SelectItem>
                    <SelectItem value="TEAM">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.scope === "TEAM" && (
                <div className="space-y-2">
                  <Label>Team</Label>
                  <Select
                    value={form.teamId}
                    onValueChange={(v) => setForm({ ...form, teamId: v ?? "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="limit">Monthly limit (USD)</Label>
                <Input
                  id="limit"
                  type="number"
                  min={1}
                  value={form.monthlyLimit}
                  onChange={(e) =>
                    setForm({ ...form, monthlyLimit: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <Button type="submit" disabled={loading || !apiMode} className="w-full">
                {apiMode ? (loading ? "Creating…" : "Create budget") : "Enable API mode to create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </PageHeader>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit monthly limit</DialogTitle>
            <DialogDescription>
              {selected?.name} — update the monthly spend cap.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-limit">Monthly limit (USD)</Label>
              <Input
                id="edit-limit"
                type="number"
                min={1}
                value={editLimit}
                onChange={(e) => setEditLimit(Number(e.target.value))}
              />
            </div>
            <Button className="w-full" disabled={loading} onClick={handleSaveEdit}>
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete budget?"
        description={`Remove "${selected?.name ?? "this budget"}"? This cannot be undone.`}
        confirmLabel="Delete budget"
        loading={loading}
        onConfirm={handleConfirmDelete}
      />

      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Organization burn rate</p>
            <p className="text-xs text-muted-foreground">
              Based on {formatCurrency(mtdSpent)} spent month to date
            </p>
          </div>
          <p className="font-mono text-lg font-semibold">
            ~{formatCurrency(dailyBurn)}/day
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            canManage={canManage && apiMode}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        ))}
      </div>

      {rows.length === 0 && (
        <EmptyState
          icon={Wallet}
          title="No budgets yet"
          description="Set a monthly cap for your organization or a team. You will get alerts as spend approaches the limit."
          actionLabel={canManage && apiMode ? "Create budget" : undefined}
          onAction={canManage && apiMode ? () => setOpen(true) : undefined}
          secondaryLabel="How budgets work"
          secondaryHref="/help/features/budgets"
        />
      )}
    </div>
  );
}
