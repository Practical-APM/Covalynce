"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { EditionBadge } from "@/components/edition-badge";
import { LinkButton } from "@/components/link-button";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/lib/api";
import { isAdmin } from "@/lib/permissions";
import { organization as mockOrg } from "@/lib/mock-data";

export default function SettingsGeneralPage() {
  const { apiMode, session, refreshMe } = useAuth();
  const initialName =
    apiMode && session ? session.organization.name : mockOrg.name;
  const slug = apiMode && session ? session.organization.slug : "acme";
  const plan = apiMode && session ? session.organization.plan : "community";
  const admin = !apiMode || isAdmin(session?.user.role ?? "VIEWER");

  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setMessage("Name must be at least 2 characters.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (apiMode && session) {
        await api.updateOrganization(session.organization.id, {
          name: trimmed,
        });
        await refreshMe();
        setMessage("Organization name updated.");
      } else {
        setMessage("Saved (demo mode: not persisted).");
      }
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not update the organization name. Try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="General"
        description="Organization profile and defaults"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Light, dark, or match your system preference across the app and docs
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Theme applies to dashboards, help center, and marketing pages.
          </p>
          <ThemeToggle variant="outline" size="sm" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edition</CardTitle>
          <CardDescription>
            You are on Community Edition unless your organization was upgraded
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <EditionBadge plan={plan} linkToHelp={false} />
          <LinkButton variant="outline" size="sm" href="/help/editions#enterprise">
            Enterprise features
          </LinkButton>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization</CardTitle>
          <CardDescription>Visible to all members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={!admin}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              defaultValue={slug}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              app.covalynce.io/{slug}
            </p>
          </div>
          {admin ? (
            <Button onClick={handleSave} disabled={saving || name.trim() === initialName.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Only admins can rename the organization.
            </p>
          )}
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data sync</CardTitle>
          <CardDescription>Provider usage collection frequency</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Sync interval: <strong>Every 15 minutes</strong>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Configurable in self-hosted deployments
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
