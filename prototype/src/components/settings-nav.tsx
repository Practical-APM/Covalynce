"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/settings", label: "General" },
  { href: "/settings/members", label: "Members" },
  { href: "/settings/cost-centers", label: "Cost centers" },
  { href: "/settings/permissions", label: "Permissions" },
  { href: "/settings/sso", label: "Single sign-on" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/audit", label: "Audit log" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-20 space-y-0.5">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Settings
      </p>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "block rounded-lg px-2.5 py-2 text-[13px] transition-colors",
            pathname === link.href
              ? "bg-accent font-medium text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/help/editions"
        className="mt-3 block rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      >
        Enterprise features
      </Link>
    </nav>
  );
}
