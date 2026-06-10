"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { KeyRound } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { isAdmin } from "@/lib/permissions";
import { useLoadEffect } from "@/hooks/use-load-effect";

export default function SettingsSsoPage() {
  const { apiMode, session } = useAuth();
  const { hasEnterpriseFeature } = useEditionFeatures();
  const admin = isAdmin(session?.user.role ?? "VIEWER");
  const ssoAllowed = hasEnterpriseFeature("sso");
  const [config, setConfig] = useState<
    Awaited<ReturnType<typeof api.getSsoConfig>> | null
  >(
    apiMode
      ? null
      : {
          provider: "NONE",
          enabled: false,
          issuerUrl: null,
          jwksUri: null,
          audience: null,
          allowedEmailDomains: [],
        }
  );
  const [domains, setDomains] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!apiMode || !admin || !ssoAllowed) return;
    const c = await api.getSsoConfig();
    setConfig(c);
    setDomains(c.allowedEmailDomains.join(", "));
  }, [apiMode, admin, ssoAllowed]);

  useLoadEffect(load, [load]);

  async function handleSave() {
    if (!config) return;
    setMessage(null);
    if (!apiMode) {
      setMessage("Saved (demo mode: not persisted).");
      return;
    }
    setSaving(true);
    try {
      await api.updateSsoConfig({
        provider: config.provider,
        enabled: config.enabled,
        issuerUrl: config.issuerUrl ?? undefined,
        jwksUri: config.jwksUri ?? undefined,
        audience: config.audience ?? undefined,
        allowedEmailDomains: domains
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
      });
      setMessage("SSO configuration saved");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save SSO config");
    } finally {
      setSaving(false);
    }
  }

  if (apiMode && !admin) {
    return (
      <p className="text-sm text-muted-foreground">Admin access required.</p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Single sign-on"
        description="Clerk or Auth0 OIDC — JWT validated via JWKS, mapped to invited users"
      />

      {!apiMode && (
        <p className="text-xs text-muted-foreground">
          Demo mode: SSO fields are read-only samples. Enterprise unlocks live IdP
          configuration.
        </p>
      )}

      {apiMode && admin && !ssoAllowed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Community auth today</CardTitle>
            <CardDescription>
              Magic link and passwordless sign-in work on Community Edition. SSO is
              gatekept on Enterprise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnterpriseFeatureGate feature="sso" />
          </CardContent>
        </Card>
      )}

      {apiMode && admin && ssoAllowed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Production checklist</CardTitle>
            <CardDescription>
              Before exposing Covalynce to design partners
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Set <code>AUTH_MODE=magic_link</code> (or <code>sso_required</code>) on the API.</p>
            <p>
              2. Add a Resend API key in{" "}
              <Link href="/settings/self-host" className="underline underline-offset-2">
                Settings → Self-host
              </Link>{" "}
              for magic links and invites.
            </p>
            <p>3. Set a strong <code>JWT_SECRET</code> — not the default placeholder.</p>
            <p>4. Disable <code>SSO_MOCK_ENABLED</code> and register your IdP issuer + JWKS below.</p>
            <p>5. Invite users before they attempt SSO — unknown emails are rejected.</p>
          </CardContent>
        </Card>
      )}

      {(config || !apiMode) && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4" />
            SSO provider
          </CardTitle>
          <CardDescription>
            Enable after configuring your IdP. Dev: set SSO_MOCK_ENABLED=true
            and use mock-sso:email tokens on login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="sso-enabled">SSO enabled</Label>
                <Switch
                  id="sso-enabled"
                  checked={config.enabled}
                  disabled={!apiMode || !ssoAllowed}
                  onCheckedChange={(enabled) =>
                    setConfig({ ...config, enabled })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={config.provider}
                  onValueChange={(v) =>
                    v && setConfig({ ...config, provider: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="CLERK">Clerk</SelectItem>
                    <SelectItem value="AUTH0">Auth0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Issuer URL</Label>
                <Input
                  value={config.issuerUrl ?? ""}
                  onChange={(e) =>
                    setConfig({ ...config, issuerUrl: e.target.value })
                  }
                  placeholder="https://your-clerk-domain"
                />
              </div>
              <div className="space-y-2">
                <Label>JWKS URI</Label>
                <Input
                  value={config.jwksUri ?? ""}
                  onChange={(e) =>
                    setConfig({ ...config, jwksUri: e.target.value })
                  }
                  placeholder="https://your-clerk-domain/.well-known/jwks.json"
                />
              </div>
              <div className="space-y-2">
                <Label>Audience (optional)</Label>
                <Input
                  value={config.audience ?? ""}
                  onChange={(e) =>
                    setConfig({ ...config, audience: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Allowed email domains</Label>
                <Input
                  value={domains}
                  onChange={(e) => setDomains(e.target.value)}
                  placeholder="company.com, subsidiary.com"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || !apiMode || (apiMode && !ssoAllowed)}
              >
                {saving ? "Saving…" : "Save SSO settings"}
              </Button>
              {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
