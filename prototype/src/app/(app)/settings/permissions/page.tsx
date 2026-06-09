"use client";

import { useCallback, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";
import { useEditionFeatures } from "@/components/edition-features-provider";
import { EnterpriseFeatureGate } from "@/components/enterprise-upsell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { isAdmin } from "@/lib/permissions";
import { useLoadEffect } from "@/hooks/use-load-effect";

const PERMISSION_LABELS: Record<string, string> = {
  "providers:read": "View providers",
  "providers:manage": "Manage providers",
  "budgets:read": "View budgets",
  "budgets:manage": "Manage budgets",
  "policies:read": "View policies",
  "policies:manage": "Manage policies",
  "gateway:read": "View gateway",
  "gateway:manage": "Manage gateway",
  "agents:read": "View agents",
  "agents:manage": "Manage agents",
  "licenses:read": "View licenses",
  "licenses:manage": "Manage licenses",
  "insights:read": "View insights",
  "insights:apply": "Apply insights",
  "members:read": "View members",
  "members:manage": "Manage members",
  "audit:view": "Audit log",
  "compliance:export": "Compliance export",
  "alerts:manage": "Alert settings",
  "sso:manage": "SSO config",
  "rbac:manage": "Role permissions",
};

export default function SettingsPermissionsPage() {
  const { apiMode, session } = useAuth();
  const { hasEnterpriseFeature } = useEditionFeatures();
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const canOverride = hasEnterpriseFeature("rbac_overrides");
  const [matrix, setMatrix] = useState<
    Awaited<ReturnType<typeof api.getRbacMatrix>> | null
  >(null);

  const load = useCallback(async () => {
    if (!apiMode || !admin) return;
    setMatrix(await api.getRbacMatrix());
  }, [apiMode, admin]);

  useLoadEffect(load, [load]);

  async function toggle(role: string, permission: string, allowed: boolean) {
    if (!canOverride) return;
    await api.updateRbacPermission({ role, permission, allowed });
    await load();
  }

  if (apiMode && !admin) {
    return (
      <p className="text-sm text-muted-foreground">Admin access required.</p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role permissions"
        description="Per-resource RBAC — customize what ADMIN, MANAGER, and VIEWER can do"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4" />
            Permission matrix
          </CardTitle>
          <CardDescription>
            {canOverride
              ? "Overrides persist per organization. Reset a role to restore defaults."
              : "View the default matrix on Community Edition. Custom overrides require Enterprise."}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {apiMode && admin && !canOverride && (
            <EnterpriseFeatureGate feature="rbac_overrides" className="mb-4" />
          )}
          {matrix && (
            <>
              {canOverride && (
                <div className="mb-4 flex gap-2">
                  {matrix.roles.map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      onClick={() => api.resetRbacRole(role).then(load)}
                    >
                      Reset {role}
                    </Button>
                  ))}
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    {matrix.roles.map((role) => (
                      <TableHead key={role} className="text-center">
                        {role}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrix.permissions.map((permission) => (
                    <TableRow key={permission}>
                      <TableCell className="text-sm">
                        {PERMISSION_LABELS[permission] ?? permission}
                      </TableCell>
                      {matrix.roles.map((role) => (
                        <TableCell key={role} className="text-center">
                          <Switch
                            checked={matrix.matrix[role]?.[permission] ?? false}
                            disabled={!canOverride}
                            onCheckedChange={(checked) =>
                              toggle(role, permission, checked)
                            }
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
