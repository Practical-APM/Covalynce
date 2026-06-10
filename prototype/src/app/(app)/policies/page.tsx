"use client";

import { useCallback, useState } from "react";
import { Download, FileUp, Pencil, Plus, Shield } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { downloadText } from "@/lib/download";
import { isAdmin } from "@/lib/permissions";
import { useLoadEffect } from "@/hooks/use-load-effect";

/** Sample rules for demo mode. */
const DEMO_RULES: Awaited<ReturnType<typeof api.listPolicies>> = [
  {
    id: "demo-deny-premium",
    name: "Block premium models org-wide",
    type: "MODEL_DENY_LIST",
    scope: "ORGANIZATION",
    enabled: true,
    config: { models: ["gpt-4o", "o3-mini"] },
    team: null,
  },
  {
    id: "demo-allow-support",
    name: "Support team: approved models only",
    type: "MODEL_ALLOW_LIST",
    scope: "TEAM",
    enabled: true,
    config: { models: ["gpt-4o-mini", "claude-haiku"] },
    team: { name: "Support" },
  },
];

export default function PoliciesPage() {
  const { apiMode, session } = useAuth();
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const [rules, setRules] = useState<
    Awaited<ReturnType<typeof api.listPolicies>>
  >(apiMode ? [] : DEMO_RULES);
  const [enforcement, setEnforcement] = useState<"MONITORING" | "HARD_CAP">(
    "MONITORING"
  );
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [yamlText, setYamlText] = useState("");
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    Awaited<ReturnType<typeof api.listPolicies>>[number] | null
  >(null);
  const [editRule, setEditRule] = useState<{
    id: string;
    models: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [enforcementError, setEnforcementError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    type: "MODEL_DENY_LIST" | "MODEL_ALLOW_LIST" | "BUDGET_HARD_CAP";
    models: string;
  }>({
    name: "",
    type: "MODEL_DENY_LIST",
    models: "gpt-4o",
  });

  const load = useCallback(async () => {
    if (!apiMode) return;
    const [r, e] = await Promise.all([
      api.listPolicies(),
      api.getEnforcement(),
    ]);
    setRules(r);
    if (e?.budgetEnforcement) setEnforcement(e.budgetEnforcement);
  }, [apiMode]);

  useLoadEffect(load, [load]);

  async function toggleEnforcement(mode: "MONITORING" | "HARD_CAP") {
    const previous = enforcement;
    setEnforcementError(null);
    setEnforcement(mode);
    try {
      await api.setEnforcement(mode);
    } catch (e) {
      setEnforcement(previous);
      setEnforcementError(
        e instanceof Error ? e.message : "Could not update enforcement."
      );
    }
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      setFormError("Policy name is required.");
      return;
    }
    const models = form.models.split(",").map((m) => m.trim()).filter(Boolean);
    if (form.type !== "BUDGET_HARD_CAP" && models.length === 0) {
      setFormError("Add at least one model.");
      return;
    }
    setFormError(null);
    setCreating(true);
    try {
      await api.createPolicy({
        name: form.name.trim(),
        type: form.type,
        config: { models },
      });
      setOpen(false);
      setForm({ name: "", type: "MODEL_DENY_LIST", models: "gpt-4o" });
      await load();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Could not create policy. Try again."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleExportYaml() {
    const res = await api.exportPoliciesYaml();
    downloadText("covalynce-policies.yaml", res.yaml, "text/yaml;charset=utf-8");
  }

  async function handleImportYaml() {
    if (!yamlText.trim()) {
      setImportMessage("Paste a YAML document to import.");
      return;
    }
    setImportMessage(null);
    setImporting(true);
    try {
      const res = await api.importPoliciesYaml(yamlText, importMode);
      setImportMessage(
        res.errors.length > 0
          ? `Imported ${res.imported} rules. Errors: ${res.errors.join("; ")}`
          : `Imported ${res.imported} rules (${res.mode})`
      );
      if (res.imported > 0) {
        setImportOpen(false);
        setYamlText("");
        await load();
      }
    } catch (e) {
      setImportMessage(
        e instanceof Error ? e.message : "Import failed. Check your YAML."
      );
    } finally {
      setImporting(false);
    }
  }

  async function toggleRuleEnabled(
    rule: Awaited<ReturnType<typeof api.listPolicies>>[number]
  ) {
    await api.updatePolicy(rule.id, { enabled: !rule.enabled });
    await load();
  }

  function openEditRule(rule: Awaited<ReturnType<typeof api.listPolicies>>[number]) {
    setEditRule({
      id: rule.id,
      models: (rule.config?.models ?? []).join(", "),
    });
    setEditOpen(true);
  }

  async function handleSaveRuleEdit() {
    if (!editRule) return;
    setSaving(true);
    try {
      const models = editRule.models
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      await api.updatePolicy(editRule.id, { config: { models } });
      setEditOpen(false);
      setEditRule(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRule() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.deletePolicy(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  const exampleYaml = `version: 1
enforcement: MONITORING
rules:
  - name: Block premium models
    type: MODEL_DENY_LIST
    scope: ORGANIZATION
    enabled: true
    config:
      models:
        - gpt-4o
        - o3-mini`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policies"
        description="Allow, deny, or cap AI usage by model and team. Enforced when traffic uses the Gateway."
        docHref="/help/features/policies"
      >
        {admin && apiMode && (
          <>
          <Button variant="outline" onClick={handleExportYaml}>
            <Download className="size-4" />
            Export YAML
          </Button>
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger className={buttonVariants({ variant: "outline" })}>
              <FileUp className="size-4" />
              Import YAML
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Import policies from YAML</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <Select
                    value={importMode}
                    onValueChange={(v) =>
                      v && setImportMode(v as "append" | "replace")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="append">Append to existing</SelectItem>
                      <SelectItem value="replace">Replace all rules</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>YAML document</Label>
                  <Textarea
                    className="min-h-48 font-mono text-xs"
                    value={yamlText}
                    onChange={(e) => setYamlText(e.target.value)}
                    placeholder={exampleYaml}
                  />
                </div>
                {importMessage && (
                  <p className="text-sm text-muted-foreground">{importMessage}</p>
                )}
                <Button
                  className="w-full"
                  disabled={importing}
                  onClick={handleImportYaml}
                >
                  {importing ? "Importing…" : "Import"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={buttonVariants()}>
              <Plus className="size-4" />
              Add policy
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New policy rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Block premium models"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      v &&
                      setForm({
                        ...form,
                        type: v as typeof form.type,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MODEL_DENY_LIST">Deny models</SelectItem>
                      <SelectItem value="MODEL_ALLOW_LIST">Allow models only</SelectItem>
                      <SelectItem value="BUDGET_HARD_CAP">Budget hard cap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.type !== "BUDGET_HARD_CAP" && (
                  <div className="space-y-2">
                    <Label>Models (comma-separated)</Label>
                    <Input
                      value={form.models}
                      onChange={(e) =>
                        setForm({ ...form, models: e.target.value })
                      }
                      placeholder="gpt-4o, o3-mini"
                    />
                  </div>
                )}
                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}
                <Button
                  className="w-full"
                  disabled={creating}
                  onClick={handleCreate}
                >
                  {creating ? "Creating…" : "Create policy"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </>
        )}
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="size-4" />
            Budget enforcement
          </CardTitle>
          <CardDescription>
            Monitoring alerts when budgets are exceeded; hard cap blocks
            gateway requests once a budget reaches 100%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={enforcement === "MONITORING" ? "default" : "outline"}
              size="sm"
              disabled={!admin || !apiMode}
              onClick={() => toggleEnforcement("MONITORING")}
            >
              Monitoring only
            </Button>
            <Button
              variant={enforcement === "HARD_CAP" ? "default" : "outline"}
              size="sm"
              disabled={!admin || !apiMode}
              onClick={() => toggleEnforcement("HARD_CAP")}
            >
              Hard cap (block)
            </Button>
          </div>
          {enforcementError && (
            <p className="text-sm text-destructive">{enforcementError}</p>
          )}
          {(!apiMode || !admin) && (
            <p className="text-xs text-muted-foreground">
              {apiMode
                ? "Only admins can change enforcement."
                : "Demo mode: sample policies shown. Sign in with the API connected to manage enforcement."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active rules</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {rules.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No policy rules yet. Add allow/deny lists or connect the gateway.
            </p>
          )}
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start justify-between gap-4 py-4 first:pt-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{rule.name}</p>
                  <Badge variant="outline" className="text-[10px]">
                    {rule.type.replace(/_/g, " ")}
                  </Badge>
                  {!rule.enabled && (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </div>
                {rule.config?.models && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {rule.config.models.join(", ")}
                  </p>
                )}
              </div>
              {admin && apiMode && (
                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRuleEnabled(rule)}
                    aria-label={`Toggle ${rule.name}`}
                  />
                  {rule.type !== "BUDGET_HARD_CAP" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit models"
                      onClick={() => openEditRule(rule)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(rule)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit model list</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Models (comma-separated)</Label>
              <Input
                value={editRule?.models ?? ""}
                onChange={(e) =>
                  setEditRule((prev) =>
                    prev ? { ...prev, models: e.target.value } : prev
                  )
                }
                placeholder="gpt-4o, o3-mini"
              />
            </div>
            <Button className="w-full" disabled={saving} onClick={handleSaveRuleEdit}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete policy rule?"
        description={`Remove "${deleteTarget?.name ?? "this rule"}"? Gateway enforcement will stop using it immediately.`}
        confirmLabel="Delete rule"
        loading={saving}
        onConfirm={handleDeleteRule}
      />
    </div>
  );
}
