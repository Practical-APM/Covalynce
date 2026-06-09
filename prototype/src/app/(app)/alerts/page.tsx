"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Bell, TrendingUp } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { alerts as mockAlerts } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { PAGE_META } from "@/lib/page-meta";

type AlertRow = {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
};

const typeIcons: Record<string, typeof Bell> = {
  budget_threshold: Bell,
  BUDGET_THRESHOLD: Bell,
  spend_spike: TrendingUp,
  SPEND_SPIKE: TrendingUp,
  provider_spike: AlertTriangle,
  PROVIDER_SPIKE: AlertTriangle,
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AlertsPage() {
  const { apiMode } = useAuth();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [settings, setSettings] = useState<{
    emailEnabled: boolean;
    slackWebhook: string | null;
  } | null>(null);

  const load = useCallback(async () => {
    if (!apiMode) {
      setAlerts(
        mockAlerts.map((a) => ({
          id: a.id,
          type: a.type,
          severity: a.severity,
          title: a.title,
          message: a.message,
          read: a.read,
          timestamp: a.timestamp,
        }))
      );
      setSettings({ emailEnabled: true, slackWebhook: "demo" });
      return;
    }
    const [list, s] = await Promise.all([
      api.listAlerts(),
      api.getAlertSettings(),
    ]);
    setAlerts(
      list.map((a) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        read: a.read,
        timestamp: formatTime(a.createdAt),
      }))
    );
    setSettings(
      s
        ? { emailEnabled: s.emailEnabled, slackWebhook: s.slackWebhook }
        : { emailEnabled: true, slackWebhook: null }
    );
  }, [apiMode]);

  useLoadEffect(load, [load]);

  useEffect(() => {
    if (apiMode && alerts.some((a) => !a.read)) {
      track("alert_triggered", { unreadCount: alerts.filter((a) => !a.read).length });
    }
  }, [apiMode, alerts]);

  async function markRead(id: string) {
    if (!apiMode) return;
    await api.markAlertRead(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  }

  async function markAllRead() {
    if (!apiMode) return;
    await api.markAllAlertsRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }

  const unread = alerts.filter((a) => !a.read);

  return (
    <div className="space-y-6">
      <PageHeader
        title={PAGE_META["/alerts"].title}
        description={PAGE_META["/alerts"].description}
        docHref={PAGE_META["/alerts"].docHref}
      >
        <div className="flex gap-2">
          {unread.length > 0 && apiMode && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
          <LinkButton variant="outline" href="/alerts/settings">
            Configure alerts
          </LinkButton>
        </div>
      </PageHeader>

      {unread.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {unread.map((alert) => {
            const Icon = typeIcons[alert.type] ?? Bell;
            const critical =
              alert.severity === "critical" || alert.severity === "CRITICAL";
            return (
              <Card
                key={alert.id}
                className={cn(
                  "cursor-pointer border-l-4 transition-colors hover:bg-muted/30",
                  critical ? "border-l-destructive" : "border-l-amber-500"
                )}
                onClick={() => markRead(alert.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        critical
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">{alert.title}</CardTitle>
                        <Badge variant="secondary" className="text-[10px]">
                          New
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {alert.message}
                      </CardDescription>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All alerts</CardTitle>
          <CardDescription>Recent notifications</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {alerts.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No alerts yet. Connect providers and set budgets to get notified.
            </p>
          )}
          {alerts.map((alert) => {
            const Icon = typeIcons[alert.type] ?? Bell;
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 py-4 first:pt-0 last:pb-0",
                  alert.read && "opacity-60"
                )}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {alert.timestamp}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alert channels</CardTitle>
          <CardDescription>Where notifications are delivered</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1">
            Email · {settings?.emailEnabled ? "Connected" : "Disabled"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            Slack ·{" "}
            {settings?.slackWebhook ? "# configured" : "Not connected"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
