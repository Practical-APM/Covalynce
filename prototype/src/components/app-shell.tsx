"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { organization as mockOrg } from "@/lib/mock-data";
import { useUnreadAlerts } from "@/hooks/use-unread-alerts";
import { useSidebar } from "@/hooks/use-sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { OrgSwitcher } from "@/components/org-switcher";
import { DataModeBadge } from "@/components/data-mode-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LinkButton } from "@/components/link-button";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function userDisplay(session: ReturnType<typeof useAuth>["session"], apiMode: boolean) {
  if (apiMode && session?.user) {
    const email = session.user.email ?? "";
    const name = email.split("@")[0] || "User";
    const initials = email.slice(0, 2).toUpperCase() || "U";
    return { label: name, initials, email };
  }
  return { label: "Demo user", initials: "DU", email: "" };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, apiMode, logout } = useAuth();
  const { unreadCount } = useUnreadAlerts();
  const {
    expanded,
    pinned,
    setHovered,
    mobileOpen,
    hydrated,
    togglePinned,
    openMobile,
    closeMobile,
    setMobileOpen,
  } = useSidebar();

  const orgName = apiMode && session ? session.organization.name : mockOrg.name;
  const orgPlan =
    apiMode && session ? (session.organization.plan ?? "Community") : mockOrg.plan;
  const user = userDisplay(session, apiMode);
  const isHelp = pathname.startsWith("/help");

  const sidebarWidth = expanded ? "16rem" : "4rem";

  return (
    <div
      className="flex min-h-screen bg-background"
      style={
        hydrated
          ? ({
              "--sidebar-width": sidebarWidth,
            } as React.CSSProperties)
          : ({ "--sidebar-width": "4rem" } as React.CSSProperties)
      }
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-30 hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out md:flex md:flex-col",
          expanded ? "w-64" : "w-16"
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AppSidebar
          collapsed={!expanded}
          pinned={pinned}
          onTogglePin={togglePinned}
          orgName={orgName}
          orgPlan={orgPlan}
          unreadCount={unreadCount}
        />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0" showCloseButton>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar
            collapsed={false}
            orgName={orgName}
            orgPlan={orgPlan}
            unreadCount={unreadCount}
            onNavigate={closeMobile}
          />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out md:pl-(--sidebar-width)"
        )}
      >
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={openMobile}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            <DataModeBadge />
            {apiMode && session && <OrgSwitcher compact />}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <LinkButton
              variant="ghost"
              size="sm"
              href="/help"
              className="hidden text-muted-foreground lg:inline-flex"
            >
              <BookOpen className="size-4" />
              Help
            </LinkButton>
            <LinkButton
              variant="ghost"
              size="icon-sm"
              href="/alerts"
              className="relative"
              aria-label={
                unreadCount > 0
                  ? `${unreadCount} unread alerts`
                  : "Alerts"
              }
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </LinkButton>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-2 pl-1"
                )}
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px] font-medium">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[120px] truncate text-sm md:inline">
                  {user.label}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user.email && (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">
                    {user.email}
                  </p>
                )}
                <DropdownMenuItem>
                  <Link href="/settings" className="w-full">
                    Organization settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/help/getting-started" className="w-full">
                    Setup guide
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => (apiMode ? logout() : undefined)}
                >
                  {apiMode ? (
                    <span className="w-full">Sign out</span>
                  ) : (
                    <Link href="/login" className="w-full">
                      Sign in
                    </Link>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main
          id="main-content"
          className={cn(
            "min-w-0 flex-1 overflow-x-hidden",
            isHelp
              ? "px-4 py-6 sm:px-6"
              : "mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8"
          )}
        >
          <div className="min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
