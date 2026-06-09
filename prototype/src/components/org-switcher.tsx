"use client";

import { useState } from "react";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useEditionFeatures } from "@/components/edition-features-provider";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useLoadEffect } from "@/hooks/use-load-effect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Membership = {
  userId: string;
  role: string;
  isActive: boolean;
  organization: { id: string; name: string; slug: string; plan: string };
};

export function OrgSwitcher({ compact }: { compact?: boolean }) {
  const { apiMode, session, switchOrganization } = useAuth();
  const { hasEnterpriseFeature } = useEditionFeatures();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  useLoadEffect(() => {
    if (!apiMode || !session) return;
    return api
      .authMemberships()
      .then((res) => setMemberships(res.memberships))
      .catch(() => setMemberships([]));
  }, [apiMode, session]);

  if (
    !apiMode ||
    !session ||
    !hasEnterpriseFeature("multi_org") ||
    memberships.length <= 1
  ) {
    return null;
  }

  const active = memberships.find((m) => m.isActive) ?? memberships[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: compact ? "sm" : "default" }),
          "max-w-[220px] justify-between gap-2"
        )}
        disabled={loading || !!switching}
      >
        <Building2 className="size-4 shrink-0 opacity-70" />
        <span className="truncate">{active.organization.name}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.map((m) => (
          <DropdownMenuItem
            key={m.organization.id}
            disabled={m.isActive || !!switching}
            onClick={async () => {
              if (m.isActive) return;
              setSwitching(m.organization.slug);
              setLoading(true);
              try {
                await switchOrganization(m.organization.slug);
                setMemberships((prev) =>
                  prev.map((x) => ({
                    ...x,
                    isActive: x.organization.id === m.organization.id,
                  }))
                );
              } finally {
                setSwitching(null);
                setLoading(false);
              }
            }}
          >
            <span className="flex flex-1 flex-col">
              <span className="font-medium">{m.organization.name}</span>
              <span className="text-xs text-muted-foreground">
                {m.organization.slug} · {m.role}
              </span>
            </span>
            {m.isActive && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
