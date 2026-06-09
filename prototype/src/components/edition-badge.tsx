"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { editionIsFree, editionLabel, planToEdition } from "@/lib/editions";
import { cn } from "@/lib/utils";

export function EditionBadge({
  plan,
  className,
  linkToHelp = true,
}: {
  plan?: string | null;
  className?: string;
  linkToHelp?: boolean;
}) {
  const edition = planToEdition(plan);
  const label = editionLabel(plan);
  const badge = (
    <Badge
      variant={editionIsFree(plan) ? "secondary" : "outline"}
      className={cn(
        "font-normal",
        edition === "community" && "border-primary/20 bg-primary/5 text-primary",
        className
      )}
    >
      {label}
      {editionIsFree(plan) ? " · Free" : ""}
    </Badge>
  );

  if (!linkToHelp || editionIsFree(plan)) return badge;

  return (
    <Link
      href="/help/editions#enterprise"
      className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      title="Enterprise Edition features"
    >
      {badge}
    </Link>
  );
}
