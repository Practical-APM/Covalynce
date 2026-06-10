"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  FileKey,
  FileText,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Pin,
  PinOff,
  Plug,
  Route,
  ScrollText,
  Settings,
  Shield,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navDescriptions } from "@/lib/nav-help";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { EditionBadge } from "@/components/edition-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const mainNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/usage", label: "Usage", icon: ScrollText },
  { href: "/models", label: "Models", icon: BarChart3 },
  { href: "/providers", label: "Providers", icon: Plug },
  { href: "/teams", label: "Teams", icon: Layers },
  { href: "/users", label: "Users", icon: Users },
] as const;

export const manageNav = [
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/gateway", label: "Gateway", icon: Route },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/policies", label: "Policies", icon: Shield },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/licenses", label: "Licenses", icon: FileKey },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarNavLink({
  href,
  label,
  icon: Icon,
  badge,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const description = navDescriptions[href];

  const linkClass = cn(
    "group relative flex items-center rounded-lg text-[13px] transition-colors duration-150",
    collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-2.5 py-2",
    active
      ? "bg-primary/8 font-medium text-foreground"
      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
  );

  const content = (
    <>
      <Icon
        className={cn(
          "size-4 shrink-0",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      {collapsed && badge !== undefined && badge > 0 && (
        <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
      )}
    </>
  );

  const link = (
    <Link href={href} className={linkClass} onClick={onNavigate}>
      {content}
    </Link>
  );

  if (collapsed || !description) {
    return collapsed ? (
      <Tooltip>
        <TooltipTrigger render={link} />
        <TooltipContent side="right">
          <p className="font-medium">{label}</p>
          {description && (
            <p className="mt-0.5 max-w-[200px] text-background/80">
              {description}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    ) : (
      link
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right" className="max-w-[220px]">
        <p className="font-medium text-background">{label}</p>
        <p className="mt-0.5 text-background/80">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar({
  collapsed,
  pinned,
  onTogglePin,
  orgName,
  orgPlan,
  unreadCount,
  onNavigate,
  className,
}: {
  collapsed: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
  orgName: string;
  orgPlan: string;
  unreadCount: number;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center",
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-3"
        )}
      >
        <BrandLogo
          size="md"
          showWordmark={!collapsed}
          tagline={collapsed ? undefined : "AI spend control"}
          href="/dashboard"
          onClick={onNavigate}
          animated={!collapsed}
          markVariant={collapsed ? "tile" : "adaptive"}
          className={collapsed ? "justify-center" : undefined}
        />
        {!collapsed && onTogglePin && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onTogglePin}
            aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
            className="shrink-0 text-muted-foreground"
          >
            {pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="mx-3 mb-2 rounded-lg border border-border/80 bg-card px-3 py-2.5 shadow-[0_1px_2px_oklch(0_0_0/0.03)]">
          <p className="truncate text-xs font-medium">{orgName}</p>
          <EditionBadge plan={orgPlan} className="mt-1.5" />
        </div>
      )}

      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-2">
        <div>
          {!collapsed && (
            <p className="ledger-label mb-1.5 px-2.5">
              Analytics
            </p>
          )}
          <div className="space-y-0.5">
            {mainNav.map((item) => (
              <SidebarNavLink
                key={item.href}
                {...item}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
        <div>
          {!collapsed && (
            <p className="ledger-label mb-1.5 px-2.5">
              Control
            </p>
          )}
          <div className="space-y-0.5">
            {manageNav.map((item) => (
              <SidebarNavLink
                key={item.href}
                {...item}
                collapsed={collapsed}
                badge={item.href === "/alerts" ? unreadCount : undefined}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="shrink-0 space-y-1 border-t border-sidebar-border p-3">
        <SidebarNavLink
          href="/help"
          label="Help Center"
          icon={BookOpen}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        {collapsed && onTogglePin && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="mx-auto flex w-full"
                  onClick={onTogglePin}
                  aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
                >
                  {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                </Button>
              }
            />
            <TooltipContent side="right">
              {pinned ? "Unpin sidebar" : "Pin sidebar open"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
