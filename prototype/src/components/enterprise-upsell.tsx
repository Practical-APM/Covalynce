import Link from "next/link";
import {
  ENTERPRISE_FEATURE_LABELS,
  type EnterpriseFeature,
} from "@/lib/edition-features";

/** Compact gate notice — Enterprise is opt-in; Community is the default path. */
export function EnterpriseFeatureGate({
  feature,
  className,
}: {
  feature: EnterpriseFeature;
  className?: string;
}) {
  const label = ENTERPRISE_FEATURE_LABELS[feature];
  return (
    <p className={className ?? "text-xs leading-relaxed text-muted-foreground"}>
      <span className="text-foreground/80">{label}</span> is part of{" "}
      <Link
        href="/help/editions#enterprise"
        className="font-medium text-primary hover:underline"
      >
        Enterprise Edition
      </Link>
      . Community Edition includes full dashboards, budgets, and provider connect.
    </p>
  );
}

/** @deprecated Use EnterpriseFeatureGate — kept for gradual migration */
export function EnterpriseUpsell({ feature }: { feature: EnterpriseFeature }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
      <EnterpriseFeatureGate feature={feature} />
    </div>
  );
}
