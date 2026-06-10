"use client";

import { useCallback, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, type OrgMember } from "@/lib/api";
import { track } from "@/lib/analytics";
import { canManageMembers, isAdmin } from "@/lib/permissions";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { orgMembers as mockMembers } from "@/lib/mock-data";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "VIEWER", label: "Viewer" },
] as const;

export default function SettingsMembersPage() {
  const { apiMode, session } = useAuth();
  const canInvite = canManageMembers(session?.user.role ?? "VIEWER");
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("VIEWER");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<OrgMember | null>(null);

  const load = useCallback(async () => {
    if (!apiMode) return;
    const list = await api.listUsers();
    setMembers(list);
  }, [apiMode]);

  useLoadEffect(() => {
    if (apiMode) return load();
  }, [apiMode, load]);

  async function handleInvite() {
    if (!session?.organization.id) return;
    setError("");
    setLoading(true);
    try {
      const result = await api.inviteUser(session.organization.id, {
        email: inviteEmail,
        role: inviteRole,
      });
      track("user_invited", { email: inviteEmail, role: inviteRole });
      const emailInfo = (result as { inviteEmail?: { sent?: boolean; demo?: boolean } })
        .inviteEmail;
      if (emailInfo?.sent) {
        setError("");
        setOpen(false);
        setInviteEmail("");
        await load();
        return;
      }
      if (emailInfo?.demo) {
        setError(
          "User created. Email not configured — share the login link manually."
        );
      }
      setInviteEmail("");
      setInviteRole("VIEWER");
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    if (!apiMode || !admin) return;
    setError("");
    try {
      await api.updateUserRole(userId, role);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function handleRemove() {
    if (!removeTarget || !apiMode) return;
    setLoading(true);
    setError("");
    try {
      await api.deleteUser(removeTarget.id);
      setRemoveTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove user");
    } finally {
      setLoading(false);
    }
  }

  const display = apiMode
    ? members.map((m) => ({
        id: m.id,
        name: m.name ?? m.email.split("@")[0],
        email: m.email,
        role: m.role,
        team: "—",
        lastActive: "—",
      }))
    : mockMembers;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Invite users and manage roles (admin, manager, viewer)"
      >
        {canInvite && apiMode && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground">
            <Plus className="size-4" />
            Invite member
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => v && setInviteRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.filter(
                      (r) => admin || r.value !== "ADMIN"
                    ).map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                className="w-full"
                onClick={handleInvite}
                disabled={!apiMode || !inviteEmail || loading}
              >
                {loading ? "Sending…" : "Send invite"}
              </Button>
              {!apiMode && (
                <p className="text-xs text-muted-foreground">
                  Enable API mode to invite real users
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
        )}
        {canInvite && !apiMode && (
          <p className="text-xs text-muted-foreground">
            Sign in with the API connected to invite members.
          </p>
        )}
      </PageHeader>

      {error && !open && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        title="Remove member?"
        description={`Remove ${removeTarget?.email ?? "this user"} from the organization? They will lose access immediately.`}
        confirmLabel="Remove member"
        loading={loading}
        onConfirm={handleRemove}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{display.length} members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                {!apiMode && <TableHead>Team</TableHead>}
                {!apiMode && <TableHead>Last active</TableHead>}
                {apiMode && admin && <TableHead className="w-[100px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {display.map((m) => {
                const isSelf = session?.user.id === m.id;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.email}
                    </TableCell>
                    <TableCell>
                      {apiMode && admin && !isSelf ? (
                        <Select
                          value={m.role}
                          onValueChange={(v) => v && handleRoleChange(m.id, v)}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary">
                          {m.role.toLowerCase()}
                        </Badge>
                      )}
                    </TableCell>
                    {!apiMode && <TableCell>{m.team}</TableCell>}
                    {!apiMode && (
                      <TableCell className="text-muted-foreground">
                        {m.lastActive}
                      </TableCell>
                    )}
                    {apiMode && admin && (
                      <TableCell>
                        {!isSelf && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove member"
                            onClick={() =>
                              setRemoveTarget(
                                members.find((x) => x.id === m.id) ?? null
                              )
                            }
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
