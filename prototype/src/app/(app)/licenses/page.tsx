"use client";

import { useCallback, useState } from "react";
import { FileKey, Pencil, Plus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
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
import { EmptyState } from "@/components/empty-state";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { isAdmin } from "@/lib/permissions";

export default function LicensesPage() {
  const { apiMode, session } = useAuth();
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const [licenses, setLicenses] = useState<
    Awaited<ReturnType<typeof api.listLicenses>>
  >([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    Awaited<ReturnType<typeof api.listLicenses>>[number] | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vendor: "OpenAI",
    planName: "Team",
    seats: "",
    monthlyCost: "",
    renewsAt: "",
  });
  const [editForm, setEditForm] = useState({
    id: "",
    seats: "",
    monthlyCost: "",
    renewsAt: "",
  });

  const load = useCallback(async () => {
    if (!apiMode) return;
    setLicenses(await api.listLicenses());
  }, [apiMode]);

  useLoadEffect(load, [load]);

  async function handleCreate() {
    await api.createLicense({
      vendor: form.vendor,
      planName: form.planName,
      seats: form.seats ? Number(form.seats) : undefined,
      monthlyCost: form.monthlyCost ? Number(form.monthlyCost) : undefined,
      renewsAt: form.renewsAt || undefined,
    });
    setOpen(false);
    await load();
  }

  function openEdit(license: Awaited<ReturnType<typeof api.listLicenses>>[number]) {
    setEditForm({
      id: license.id,
      seats: license.seats != null ? String(license.seats) : "",
      monthlyCost:
        license.monthlyCost != null ? String(license.monthlyCost) : "",
      renewsAt: license.renewsAt
        ? new Date(license.renewsAt).toISOString().slice(0, 10)
        : "",
    });
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      await api.updateLicense(editForm.id, {
        seats: editForm.seats ? Number(editForm.seats) : null,
        monthlyCost: editForm.monthlyCost ? Number(editForm.monthlyCost) : null,
        renewsAt: editForm.renewsAt || null,
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
      await api.deleteLicense(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  const totalMonthly = licenses.reduce(
    (s, l) => s + Number(l.monthlyCost ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Licenses"
        description="Track enterprise AI subscriptions (seats, renewals) alongside API usage spend."
        docHref="/help/concepts"
      >
        {admin && apiMode && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className={buttonVariants()}>
              <Plus className="size-4" />
              Add license
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New license</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Input
                    value={form.vendor}
                    onChange={(e) =>
                      setForm({ ...form, vendor: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Input
                    value={form.planName}
                    onChange={(e) =>
                      setForm({ ...form, planName: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Seats</Label>
                    <Input
                      type="number"
                      value={form.seats}
                      onChange={(e) =>
                        setForm({ ...form, seats: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly cost</Label>
                    <Input
                      type="number"
                      value={form.monthlyCost}
                      onChange={(e) =>
                        setForm({ ...form, monthlyCost: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Renews at</Label>
                  <Input
                    type="date"
                    value={form.renewsAt}
                    onChange={(e) =>
                      setForm({ ...form, renewsAt: e.target.value })
                    }
                  />
                </div>
                <Button className="w-full" onClick={handleCreate}>
                  Save license
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {licenses.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Fixed license spend (monthly)
            </p>
            <p className="font-mono text-2xl font-semibold">
              {formatCurrency(totalMonthly)}
            </p>
          </CardContent>
        </Card>
      )}

      {apiMode && licenses.length === 0 && (
        <EmptyState
          icon={FileKey}
          title="No licenses tracked"
          description="Add OpenAI Team, Anthropic Enterprise, or other fixed contracts to compare license vs usage spend."
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {licenses.map((license) => (
          <Card key={license.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{license.vendor}</CardTitle>
              <CardDescription>{license.planName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {license.monthlyCost != null && (
                <p>
                  <span className="text-muted-foreground">Cost: </span>
                  {formatCurrency(Number(license.monthlyCost))}/mo
                </p>
              )}
              {license.seats != null && (
                <p>
                  <span className="text-muted-foreground">Seats: </span>
                  {license.seats}
                </p>
              )}
              {license.renewsAt && (
                <p>
                  <span className="text-muted-foreground">Renews: </span>
                  {new Date(license.renewsAt).toLocaleDateString()}
                </p>
              )}
              {admin && (
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(license)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(license)}
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
            <DialogTitle>Edit license</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Seats</Label>
                <Input
                  type="number"
                  value={editForm.seats}
                  onChange={(e) =>
                    setEditForm({ ...editForm, seats: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly cost</Label>
                <Input
                  type="number"
                  value={editForm.monthlyCost}
                  onChange={(e) =>
                    setEditForm({ ...editForm, monthlyCost: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Renews at</Label>
              <Input
                type="date"
                value={editForm.renewsAt}
                onChange={(e) =>
                  setEditForm({ ...editForm, renewsAt: e.target.value })
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
        title="Delete license?"
        description={`Remove the ${deleteTarget?.vendor ?? ""} ${deleteTarget?.planName ?? "license"} record?`}
        confirmLabel="Delete license"
        loading={saving}
        onConfirm={handleDelete}
      />
    </div>
  );
}
