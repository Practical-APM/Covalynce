"use client";

import {
  PROVIDER_BRANDS,
  ProviderBrandLogo,
  type ProviderBrandId,
} from "@/components/landing/provider-brand-logo";
import { cn } from "@/lib/utils";

export const FEATURED_PROVIDER_IDS: ProviderBrandId[] = [
  "openai",
  "anthropic",
  "gemini",
];

const sizeMap = {
  xs: "size-4",
  sm: "size-5",
  md: "size-6",
  lg: "size-7",
};

/** Compact provider row — icons only, no card tiles */
export function ProviderLogoStrip({
  ids = FEATURED_PROVIDER_IDS,
  size = "sm",
  label,
  className,
}: {
  ids?: ProviderBrandId[];
  size?: keyof typeof sizeMap;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
      )}
      <ul className="flex flex-wrap items-center gap-4">
        {ids.map((id) => {
          const name = PROVIDER_BRANDS.find((p) => p.id === id)?.name ?? id;
          return (
            <li key={id} className="flex items-center gap-2" title={name}>
              <ProviderBrandLogo id={id} className={sizeMap[size]} />
              <span className="text-xs font-medium text-muted-foreground">{name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
