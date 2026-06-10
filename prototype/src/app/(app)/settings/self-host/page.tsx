"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  KeyRound,
  Mail,
  ServerCog,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LinkButton } from "@/components/link-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type InstanceSettingItem, type InstanceStatus } from "@/lib/api";
import { isAdmin } from "@/lib/permissions";
import { useLoadEffect } from "@/hooks/use-load-effect";

/** Sample configuration shown in demo mode so the page is explorable. */
const DEMO_SETTINGS: InstanceSettingItem[] = [
  { key: "RESEND_API_KEY", label: "Resend API key", group: "email", secret: true, placeholder: "re_xxxxxxxxxxxx", helpAnchor: "resend", source: "database", preview: "••••••••4f2a", updatedAt: null },
  { key: "ALERT_FROM_EMAIL", label: "From address", group: "email", secret: false, placeholder: "alerts@yourdomain.com", helpAnchor: "resend", source: "database", preview: "alerts@acme.dev", updatedAt: null },
  { key: "OPENAI_OAUTH_CLIENT_ID", label: "OpenAI OAuth client ID", group: "oauth_openai", secret: false, placeholder: null, helpAnchor: "provider-oauth", source: "environment", preview: "cov_openai_client", updatedAt: null },
  { key: "OPENAI_OAUTH_CLIENT_SECRET", label: "OpenAI OAuth client secret", group: "oauth_openai", secret: true, placeholder: null, helpAnchor: "provider-oauth", source: "environment", preview: "••••••••9c1e", updatedAt: null },
  { key: "OPENAI_OAUTH_REDIRECT_URI", label: "OpenAI OAuth redirect URI", group: "oauth_openai", secret: false, placeholder: "https://your-app.example.com/providers/oauth/callback", helpAnchor: "provider-oauth", source: "environment", preview: "https://app.acme.dev/providers/oauth/callback", updatedAt: null },
  { key: "ANTHROPIC_OAUTH_CLIENT_ID", label: "Anthropic OAuth client ID", group: "oauth_anthropic", secret: false, placeholder: null, helpAnchor: "provider-oauth", source: "none", preview: null, updatedAt: null },
  { key: "ANTHROPIC_OAUTH_CLIENT_SECRET", label: "Anthropic OAuth client secret", group: "oauth_anthropic", secret: true, placeholder: null, helpAnchor: "provider-oauth", source: "none", preview: null, updatedAt: null },
  { key: "ANTHROPIC_OAUTH_REDIRECT_URI", label: "Anthropic OAuth redirect URI", group: "oauth_anthropic", secret: false, placeholder: "https://your-app.example.com/providers/oauth/callback", helpAnchor: "provider-oauth", source: "none", preview: null, updatedAt: null },
  { key: "GOOGLE_OAUTH_CLIENT_ID", label: "Google OAuth client ID", group: "oauth_google", secret: false, placeholder: null, helpAnchor: "provider-oauth", source: "none", preview: null, updatedAt: null },
  { key: "GOOGLE_OAUTH_CLIENT_SECRET", label: "Google OAuth client secret", group: "oauth_google", secret: true, placeholder: null, helpAnchor: "provider-oauth", source: "none", preview: null, updatedAt: null },
  { key: "GOOGLE_OAUTH_REDIRECT_URI", label: "Google OAuth redirect URI", group: "oauth_google", secret: false, placeholder: "https://your-app.example.com/providers/oauth/callback", helpAnchor: "provider-oauth", source: "none", preview: null, updatedAt: null },
];

const DEMO_STATUS: InstanceStatus = {
  databaseConnected: true,
  authMode: "magic_link",
  nodeEnv: "production",
  jwtSecret: { set: true, isDefault: false },
  encryptionKey: { set: true, isDefault: false },
  emailConfigured: true,
  frontendUrl: "https://app.acme.dev",
  corsOrigin: "https://app.acme.dev",
};

const OAUTH_GROUPS = [
  { group: "oauth_openai" as const, title: "OpenAI" },
  { group: "oauth_anthropic" as const, title: "Anthropic" },
  { group: "oauth_google" as const, title: "Google (Gemini)" },
];

function SourceBadge({ source }: { source: InstanceSettingItem["source"] }) {
  if (source === "database") {
    return (
      <Badge variant="outline" className="border-primary/40 text-[10px] uppercase tracking-wide">
        Saved · encrypted
      </Badge>
    );
  }
  if (source === "environment") {
    return (
      <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
        From env var
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-dashed text-[10px] uppercase tracking-wide text-muted-foreground">
      Not set
    </Badge>
  );
}

function StatusRow({
  ok,
  warn,
  label,
  value,
}: {
  ok: boolean;
  warn?: boolean;
  label: string;
  value: string;
}) {
  const Icon = ok ? CheckCircle2 : warn ? AlertTriangle : XCircle;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="flex items-center gap-2 text-sm">
        <Icon
          className={
            ok
              ? "size-4 text-emerald-600 dark:text-emerald-400"
              : warn
                ? "size-4 text-amber-600 dark:text-amber-400"
                : "size-4 text-red-600 dark:text-red-400"
          }
        />
        {label}
      </span>
      <span className="ledger-value text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

export default function SettingsSelfHostPage() {
  const { apiMode, session, logout } = useAuth();
  const admin = !apiMode || isAdmin(session?.user.role ?? "VIEWER");

  const [settings, setSettings] = useState<InstanceSettingItem[]>(
    apiMode ? [] : DEMO_SETTINGS
  );
  const [status, setStatus] = useState<InstanceStatus | null>(
    apiMode ? null : DEMO_STATUS
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingGroup, setSavingGroup] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    if (!apiMode || !admin) return;
    const res = await api.getInstanceSettings();
    setSettings(res.settings);
    setStatus(res.status);
  }, [apiMode, admin]);

  useLoadEffect(load, [load]);

  const byKey = useMemo(
    () => new Map(settings.map((s) => [s.key, s])),
    [settings]
  );

  function setDraft(key: string, value: string) {
    setDrafts((d) => ({ ...d, [key]: value }));
  }

  function dirtyKeysInGroup(group: InstanceSettingItem["group"]) {
    return settings
      .filter((s) => s.group === group)
      .map((s) => s.key)
      .filter((key) => drafts[key] !== undefined && drafts[key] !== "");
  }

  async function saveGroup(group: InstanceSettingItem["group"], label: string) {
    const keys = dirtyKeysInGroup(group);
    if (keys.length === 0) {
      setMessage("Nothing to save: enter a value first.");
      return;
    }
    setSavingGroup(group);
    setMessage(null);
    try {
      if (apiMode) {
        const values = Object.fromEntries(keys.map((k) => [k, drafts[k]]));
        const res = await api.updateInstanceSettings(values);
        setSettings(res.settings);
        const fresh = await api.getInstanceSettings();
        setStatus(fresh.status);
      } else {
        setSettings((prev) =>
          prev.map((s) =>
            keys.includes(s.key)
              ? {
                  ...s,
                  source: "database",
                  preview: s.secret
                    ? `••••••••${drafts[s.key].slice(-4)}`
                    : drafts[s.key],
                }
              : s
          )
        );
      }
      setDrafts((d) => {
        const next = { ...d };
        for (const k of keys) delete next[k];
        return next;
      });
      setMessage(
        apiMode
          ? `${label} saved. Secrets are encrypted before they touch the database.`
          : `${label} saved (demo mode: not persisted).`
      );
    } catch (e) {
      setMessage(String(e));
    } finally {
      setSavingGroup(null);
    }
  }

  async function clearSetting(key: string) {
    setMessage(null);
    try {
      if (apiMode) {
        const res = await api.updateInstanceSettings({ [key]: null });
        setSettings(res.settings);
      } else {
        setSettings((prev) =>
          prev.map((s) =>
            s.key === key ? { ...s, source: "none", preview: null } : s
          )
        );
      }
      setMessage("Stored value removed.");
    } catch (e) {
      setMessage(String(e));
    }
  }

  async function handleTestEmail() {
    setTestingEmail(true);
    setMessage(null);
    try {
      if (!apiMode) {
        setMessage("Demo mode: a real deployment sends the test email to your inbox.");
        return;
      }
      const res = await api.sendInstanceTestEmail();
      setMessage(
        res.sent
          ? `Test email sent to ${session?.user.email}. Check your inbox.`
          : `Send failed${res.error ? `: ${res.error}` : ""}`
      );
    } catch (e) {
      setMessage(String(e));
    } finally {
      setTestingEmail(false);
    }
  }

  async function handleResetAccess() {
    setResetting(true);
    try {
      if (apiMode) {
        await api.revokeAllSessions();
        await logout();
        return;
      }
      setResetOpen(false);
      setMessage(
        "Demo mode: a real deployment revokes every session and signs you out."
      );
    } catch (e) {
      setMessage(String(e));
    } finally {
      setResetting(false);
    }
  }

  function renderField(key: string) {
    const item = byKey.get(key);
    if (!item) return null;
    return (
      <div key={item.key} className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={item.key}>{item.label}</Label>
          <div className="flex items-center gap-2">
            <SourceBadge source={item.source} />
            {item.source === "database" && (
              <button
                type="button"
                onClick={() => clearSetting(item.key)}
                disabled={!admin}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <Input
          id={item.key}
          type={item.secret ? "password" : "text"}
          autoComplete="off"
          value={drafts[item.key] ?? ""}
          onChange={(e) => setDraft(item.key, e.target.value)}
          placeholder={
            item.preview
              ? `${item.preview} (enter a new value to replace)`
              : (item.placeholder ?? "")
          }
          disabled={!admin}
        />
      </div>
    );
  }

  const resetCard = (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reset access</CardTitle>
          <CardDescription>
            Lost a laptop or rotated a credential? Revoke every active session
            and pending sign-in link for your account, then sign in fresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            You will be signed out everywhere, including this browser.
          </p>
          <Button variant="destructive" onClick={() => setResetOpen(true)}>
            Sign out everywhere
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Sign out everywhere?"
        description="Every active session and pending sign-in link for your account is revoked immediately. You will need to sign in again on all devices."
        confirmLabel="Revoke all sessions"
        loading={resetting}
        onConfirm={handleResetAccess}
      />
    </>
  );

  if (apiMode && !admin) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Self-host"
          description="Instance credentials and deployment health"
        />
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Admin access is required to manage instance credentials. You can
            still reset access for your own account below.
          </CardContent>
        </Card>
        {message && (
          <p className="rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm">
            {message}
          </p>
        )}
        {resetCard}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Self-host"
        description="Run Covalynce on your own infrastructure: bring your own database, email, and OAuth credentials"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-sm text-muted-foreground">
          New to self-hosting? The walkthrough covers every credential on this
          page: where to create it, what it costs, and where to paste it.
        </p>
        <LinkButton variant="outline" size="sm" href="/help/self-host">
          <BookOpen className="size-4" />
          Open the self-host guide
        </LinkButton>
      </div>

      {!apiMode && (
        <p className="text-xs text-muted-foreground">
          Demo mode: showing sample configuration. Connect the API to manage a
          real deployment.
        </p>
      )}

      {message && (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-sm">
          {message}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ServerCog className="size-4" />
            Deployment status
          </CardTitle>
          <CardDescription>
            Bootstrap configuration lives in your API environment (.env). It is
            checked here but managed on the server, never stored by Covalynce.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status ? (
            <div>
              <StatusRow
                ok={status.databaseConnected}
                label="Database (DATABASE_URL)"
                value={status.databaseConnected ? "connected" : "unreachable"}
              />
              <StatusRow
                ok={status.jwtSecret.set && !status.jwtSecret.isDefault}
                warn={status.jwtSecret.set && status.jwtSecret.isDefault}
                label="JWT secret (JWT_SECRET)"
                value={
                  !status.jwtSecret.set
                    ? "missing"
                    : status.jwtSecret.isDefault
                      ? "default value: replace it"
                      : "set"
                }
              />
              <StatusRow
                ok={status.encryptionKey.set && !status.encryptionKey.isDefault}
                warn={status.encryptionKey.set && status.encryptionKey.isDefault}
                label="Credential encryption key (CREDENTIALS_ENCRYPTION_KEY)"
                value={
                  !status.encryptionKey.set
                    ? "missing"
                    : status.encryptionKey.isDefault
                      ? "default value: replace it"
                      : "set"
                }
              />
              <StatusRow
                ok={status.emailConfigured}
                warn={!status.emailConfigured}
                label="Email delivery"
                value={status.emailConfigured ? "configured" : "not configured"}
              />
              <StatusRow
                ok
                label="Auth mode"
                value={status.authMode}
              />
              <StatusRow
                ok
                label="Environment"
                value={status.nodeEnv}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading status…</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4" />
            Email delivery (Resend)
          </CardTitle>
          <CardDescription>
            Powers magic-link sign-in, member invites, budget alerts, and
            chargeback reports. Saved here at runtime: no restart needed.{" "}
            <Link href="/help/self-host#resend" className="underline underline-offset-2 hover:text-foreground">
              How to get a Resend key
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-xl space-y-4">
          {renderField("RESEND_API_KEY")}
          {renderField("ALERT_FROM_EMAIL")}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => saveGroup("email", "Email settings")}
              disabled={savingGroup === "email" || !admin}
            >
              {savingGroup === "email" ? "Saving…" : "Save email settings"}
            </Button>
            <Button
              variant="outline"
              onClick={handleTestEmail}
              disabled={testingEmail || !admin}
            >
              {testingEmail ? "Sending…" : "Send test email"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4" />
            Provider OAuth apps
          </CardTitle>
          <CardDescription>
            Optional. Lets your team connect OpenAI, Anthropic, or Google with
            one click instead of pasting API keys. Skip this if API-key connect
            is enough.{" "}
            <Link href="/help/self-host#provider-oauth" className="underline underline-offset-2 hover:text-foreground">
              How to register OAuth apps
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {OAUTH_GROUPS.map(({ group, title }) => (
            <div key={group} className="max-w-xl space-y-4">
              <p className="ledger-label">{title}</p>
              {settings
                .filter((s) => s.group === group)
                .map((s) => renderField(s.key))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveGroup(group, `${title} OAuth credentials`)}
                disabled={savingGroup === group || !admin}
              >
                {savingGroup === group ? "Saving…" : `Save ${title} credentials`}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4" />
            What this instance stores
          </CardTitle>
          <CardDescription>
            Self-hosted means all of it lives in your Postgres. Nothing is sent
            to Covalynce or any third party beyond the providers you connect.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 text-sm sm:grid-cols-2">
          <div className="space-y-2">
            <p className="ledger-label">Stored, and why</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>Account email, name, role: sign-in and access control</li>
              <li>Session and sign-in tokens (SHA-256 hashed): keeping you signed in</li>
              <li>Provider and integration credentials (AES-256 encrypted): syncing usage</li>
              <li>Usage metadata (model, tokens, cost): the product itself</li>
              <li>Audit log of admin actions: accountability</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="ledger-label">Never stored</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>Prompt or completion content: the Gateway meters, it does not retain</li>
              <li>Passwords: sign-in is passwordless (magic link or SSO)</li>
              <li>Payment details: Community Edition has no billing</li>
              <li>Plaintext secrets: encrypted at rest, masked in this UI and the API</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {resetCard}
    </div>
  );
}
