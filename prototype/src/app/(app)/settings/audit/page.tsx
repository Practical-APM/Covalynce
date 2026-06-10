"use client";

import { useCallback, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/components/auth-provider";
import { useEditionFeatures } from "@/components/edition-features-provider";
import { usePermissions } from "@/components/permissions-provider";
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
import { auditLog as mockAuditLog } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { downloadText } from "@/lib/download";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { canViewAuditLog } from "@/lib/permissions";

type AuditRow = {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  resource: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SettingsAuditPage() {
  const { apiMode, session } = useAuth();
  const { hasEnterpriseFeature } = useEditionFeatures();
  const { hasPermission } = usePermissions();
  const role = session?.user.role ?? "VIEWER";
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const allowed = canViewAuditLog(role);

  const load = useCallback(async (cursor?: string, append = false) => {
    if (!apiMode) {
      setRows(
        mockAuditLog.map((e) => ({
          id: e.id,
          createdAt: e.timestamp,
          actor: e.actor,
          action: e.action,
          resource: e.resource,
        }))
      );
      return;
    }
    const res = await api.listAuditLogs({ cursor, limit: 50 });
    const mapped = res.items.map((l) => ({
      id: l.id,
      createdAt: formatTime(l.createdAt),
      actor: l.actor?.email ?? l.actor?.name ?? "System",
      action: l.action,
      resource: l.resource,
    }));
    setRows((prev) => (append ? [...prev, ...mapped] : mapped));
    setNextCursor(res.nextCursor);
    setHasMore(res.hasMore);
  }, [apiMode]);

  useLoadEffect(() => {
    if (allowed) return load();
  }, [allowed, load]);

  async function handleComplianceExport() {
    if (!apiMode) return;
    setExportError(null);
    setExporting(true);
    try {
      const bundle = await api.exportComplianceBundle(30);
      for (const file of bundle.files) {
        downloadText(file.filename, file.content, "text/csv;charset=utf-8");
      }
    } catch (e) {
      setExportError(
        e instanceof Error ? e.message : "Compliance export failed."
      );
    } finally {
      setExporting(false);
    }
  }

  if (apiMode && !allowed) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Audit log"
          description="Immutable record of configuration changes"
        />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Admin access required to view audit logs.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Immutable record of configuration changes on Community Edition"
      >
        {apiMode &&
          allowed &&
          hasPermission("compliance:export") &&
          hasEnterpriseFeature("compliance_export") && (
          <Button
            variant="outline"
            onClick={handleComplianceExport}
            disabled={exporting}
          >
            <Download className="size-4" />
            {exporting ? "Exporting…" : "Export compliance bundle"}
          </Button>
        )}
      </PageHeader>

      {exportError && (
        <p className="text-sm text-destructive">{exportError}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>
            Paginated audit trail for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No audit events yet.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground">
                    {entry.createdAt}
                  </TableCell>
                  <TableCell>{entry.actor}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.action}
                  </TableCell>
                  <TableCell>{entry.resource}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {apiMode && hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={loadingMore}
                onClick={async () => {
                  if (!nextCursor) return;
                  setLoadingMore(true);
                  try {
                    await load(nextCursor, true);
                  } finally {
                    setLoadingMore(false);
                  }
                }}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
