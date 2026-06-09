"use client";

import { useCallback, useState } from "react";
import { Bot, Pencil, Plus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { isAdmin } from "@/lib/permissions";

export default function AgentsPage() {
  const { apiMode, session } = useAuth();
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const [agents, setAgents] = useState<
    Awaited<ReturnType<typeof api.listAgents>>
  >([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    Awaited<ReturnType<typeof api.listAgents>>[number] | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    monthlyBudget: "",
  });
  const [editForm, setEditForm] = useState({
    id: "",
    description: "",
    monthlyBudget: "",
    enabled: true,
  });

  const load = useCallback(async () => {
    if (!apiMode) return;
    setAgents(await api.listAgents());
  }, [apiMode]);

  useLoadEffect(load, [load]);

  async function handleCreate() {
    await api.createAgent({
      name: form.name,
      slug: form.slug || undefined,
      monthlyBudget: form.monthlyBudget
        ? Number(form.monthlyBudget)
        : undefined,
    });
    setOpen(false);
    setForm({ name: "", slug: "", monthlyBudget: "" });
    await load();
  }

  function openEdit(agent: Awaited<ReturnType<typeof api.listAgents>>[number]) {
    setEditForm({
      id: agent.id,
      description: agent.description ?? "",
      monthlyBudget:
        agent.monthlyBudget != null ? String(agent.monthlyBudget) : "",
      enabled: agent.enabled,
    });
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      await api.updateAgent(editForm.id, {
        description: editForm.description || undefined,
        monthlyBudget: editForm.monthlyBudget
          ? Number(editForm.monthlyBudget)
          : null,
        enabled: editForm.enabled,
      });
      setEditOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.deleteAgent(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Register AI apps and bots, set per-agent budgets, and tag gateway calls with X-Covalynce-Agent-Id."
        docHref="/help/concepts#agent"
      >
        {admin && apiMode && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={buttonVariants()}>
              <Plus className="size-4" />
              Register agent
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Support bot"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (optional)</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value })
                    }
                    placeholder="support-bot"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly budget (USD)</Label>
                  <Input
                    type="number"
                    value={form.monthlyBudget}
                    onChange={(e) =>
                      setForm({ ...form, monthlyBudget: e.target.value })
                    }
                    placeholder="500"
                  />
                </div>
                <Button className="w-full" onClick={handleCreate}>
                  Create agent
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {apiMode && agents.length === 0 && (
        <EmptyState
          icon={Bot}
          title="No agents registered"
          description="Track spend per agent or workflow. Pass the agent slug in X-Covalynce-Agent-Id on gateway requests."
          actionLabel={admin ? "Register agent" : undefined}
          onAction={admin ? () => setOpen(true) : undefined}
          secondaryLabel="Gateway guide"
          secondaryHref="/help/features/gateway"
        />
      )}

      {!apiMode && (
        <EmptyState
          icon={Bot}
          title="Agents require live API"
          description="Sign in with API mode to register agents and track per-bot spend."
          actionLabel="Sign in"
          actionHref="/login"
          secondaryLabel="View demo Overview"
          secondaryHref="/dashboard"
        />
      )}

      <div className="grid gap-4">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {agent.slug}
                  </CardDescription>
                </div>
                <Badge variant={agent.enabled ? "default" : "secondary"}>
                  {agent.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spend MTD</span>
                <span className="font-mono">
                  {formatCurrency(agent.spent)}
                  {agent.monthlyBudget != null &&
                    ` / ${formatCurrency(agent.monthlyBudget)}`}
                </span>
              </div>
              {agent.utilization != null && (
                <Progress
                  value={Math.min(agent.utilization, 100)}
                  className={
                    agent.utilization >= 90
                      ? "[&>div]:bg-amber-500"
                      : undefined
                  }
                />
              )}
              {admin && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(agent)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(agent)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Customer support automation"
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly budget (USD)</Label>
              <Input
                type="number"
                value={editForm.monthlyBudget}
                onChange={(e) =>
                  setEditForm({ ...editForm, monthlyBudget: e.target.value })
                }
                placeholder="500"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enabled</Label>
              <Switch
                checked={editForm.enabled}
                onCheckedChange={(v) =>
                  setEditForm({ ...editForm, enabled: v })
                }
              />
            </div>
            <Button className="w-full" disabled={saving} onClick={handleSaveEdit}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete agent?"
        description={`Remove "${deleteTarget?.name ?? "this agent"}"? Gateway calls tagged with this agent will no longer be attributed.`}
        confirmLabel="Delete agent"
        loading={saving}
        onConfirm={handleDelete}
      />
    </div>
  );
}
