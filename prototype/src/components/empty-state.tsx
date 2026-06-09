import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { LinkButton } from "@/components/link-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  secondaryOnAction,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryOnAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="size-7 text-primary" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {actionLabel && actionHref && (
          <LinkButton href={actionHref}>{actionLabel}</LinkButton>
        )}
        {actionLabel && onAction && !actionHref && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
        {secondaryLabel && secondaryHref && (
          <LinkButton variant="outline" href={secondaryHref}>
            {secondaryLabel}
          </LinkButton>
        )}
        {secondaryLabel && secondaryOnAction && !secondaryHref && (
          <Button variant="outline" onClick={secondaryOnAction}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function SyncHealthBanner({
  overall,
  providerCount,
  errorCount,
  staleCount,
  className,
}: {
  overall: "healthy" | "degraded" | "error" | "empty";
  providerCount: number;
  errorCount: number;
  staleCount: number;
  className?: string;
}) {
  if (overall === "empty") return null;

  const styles = {
    healthy: "border-emerald-500/25 bg-emerald-500/6",
    degraded: "border-amber-500/25 bg-amber-500/6",
    error: "border-destructive/25 bg-destructive/6",
    empty: "",
  };

  const messages = {
    healthy: `All ${providerCount} providers synced successfully.`,
    degraded: `${staleCount} provider${staleCount === 1 ? "" : "s"} overdue for sync (over 30 minutes).`,
    error: `${errorCount} provider${errorCount === 1 ? "" : "s"} failed sync. Retry from Providers.`,
    empty: "",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
        styles[overall],
        className
      )}
    >
      <div>
        <p className="text-sm font-medium capitalize">Sync health: {overall}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{messages[overall]}</p>
      </div>
      <Link
        href="/providers"
        className="text-sm font-medium text-primary hover:underline"
      >
        View providers
      </Link>
    </div>
  );
}
