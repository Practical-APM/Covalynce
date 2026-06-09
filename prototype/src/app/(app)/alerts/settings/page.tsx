"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { isAdmin } from "@/lib/permissions";

function formatDelivery(
  at: string | null,
  status: string | null,
  error: string | null
) {
  if (!at && !status) return "No deliveries yet";
  const when = at ? new Date(at).toLocaleString() : "";
  const label = status === "sent" ? "Delivered" : status === "demo" ? "Demo (logged)" : "Failed";
  return `${label}${when ? ` · ${when}` : ""}${error ? ` — ${error}` : ""}`;
}

export default function AlertSettingsPage() {
  const { apiMode, session } = useAuth();
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const [threshold, setThreshold] = useState(90);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<{
    emailDeliveryConfigured: boolean;
    lastEmailDeliveryAt: string | null;
    lastEmailDeliveryStatus: string | null;
    lastEmailDeliveryError: string | null;
    lastSlackDeliveryAt: string | null;
    lastSlackDeliveryStatus: string | null;
    lastSlackDeliveryError: string | null;
  } | null>(null);

  const load = useCallback(async () => {
    if (!apiMode) return;
    const s = await api.getAlertSettings();
    setThreshold(s.budgetThresholdPercent);
    setSlackWebhook(s.slackWebhook ?? "");
    setEmailEnabled(s.emailEnabled);
    setDelivery({
      emailDeliveryConfigured: s.emailDeliveryConfigured,
      lastEmailDeliveryAt: s.lastEmailDeliveryAt,
      lastEmailDeliveryStatus: s.lastEmailDeliveryStatus,
      lastEmailDeliveryError: s.lastEmailDeliveryError,
      lastSlackDeliveryAt: s.lastSlackDeliveryAt,
      lastSlackDeliveryStatus: s.lastSlackDeliveryStatus,
      lastSlackDeliveryError: s.lastSlackDeliveryError,
    });
  }, [apiMode]);

  useLoadEffect(load, [load]);

  async function handleSave() {
    if (!apiMode || !admin) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.updateAlertSettings({
        budgetThresholdPercent: threshold,
        slackWebhook: slackWebhook || undefined,
        emailEnabled,
      });
      setMessage("Settings saved.");
      await load();
    } catch (e) {
      setMessage(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleTestSlack() {
    if (!apiMode || !admin) return;
    setTesting(true);
    setMessage(null);
    try {
      const res = await api.testSlack();
      if (res.demo) {
        setMessage("Demo mode — check API logs for Slack message.");
      } else if (res.sent) {
        setMessage("Test message sent to Slack.");
      } else {
        setMessage(res.error ?? "Failed to send test message.");
      }
      await load();
    } catch (e) {
      setMessage(String(e));
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/alerts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Alerts
      </Link>

      <PageHeader
        title="Alert settings"
        description="Configure thresholds and notification channels"
      />

      {apiMode && !admin && (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Admin access required to change alert settings.
          </CardContent>
        </Card>
      )}

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget alerts</CardTitle>
          <CardDescription>Notify when spend reaches threshold</CardDescription>
        </CardHeader>
        <CardContent className="max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">Threshold (% of budget)</Label>
            <Input
              id="threshold"
              type="number"
              min={50}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSave} disabled={saving || !apiMode || !admin}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Slack</CardTitle>
          <CardDescription>Post alerts to a channel</CardDescription>
        </CardHeader>
        <CardContent className="max-w-lg space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook">Webhook URL</Label>
            <Input
              id="webhook"
              placeholder="https://hooks.slack.com/services/..."
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTestSlack} disabled={testing || !apiMode || !admin}>
              {testing ? "Testing…" : "Test connection"}
            </Button>
            <Button onClick={handleSave} disabled={saving || !apiMode || !admin}>
              Save webhook
            </Button>
          </div>
          {delivery?.lastSlackDeliveryAt && (
            <p className="text-xs text-muted-foreground">
              Last Slack:{" "}
              {formatDelivery(
                delivery.lastSlackDeliveryAt,
                delivery.lastSlackDeliveryStatus,
                delivery.lastSlackDeliveryError
              )}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email</CardTitle>
          <CardDescription>Send to organization admins</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {emailEnabled
              ? delivery?.emailDeliveryConfigured
                ? "Enabled · emails sent to admins via Resend"
                : "Enabled · set RESEND_API_KEY on API to send real email"
              : "Disabled"}
          </p>
          {delivery && (
            <p className="text-xs text-muted-foreground">
              Last email:{" "}
              {formatDelivery(
                delivery.lastEmailDeliveryAt,
                delivery.lastEmailDeliveryStatus,
                delivery.lastEmailDeliveryError
              )}
            </p>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              disabled={!apiMode || !admin}
              className="size-4 rounded border-border"
            />
            Email alerts
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
