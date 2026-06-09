import Link from "next/link";
import { CovalynceMarkSvg } from "@/components/brand/covalynce-mark-svg";
import { cn } from "@/lib/utils";

const sizes = {
  xs: "size-6",
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
  xl: "size-12",
} as const;

export function CovalynceMark({
  className,
  size = "md",
  animated = false,
  variant = "adaptive",
}: {
  className?: string;
  size?: keyof typeof sizes;
  animated?: boolean;
  variant?: "adaptive" | "tile" | "neon";
}) {
  return (
    <CovalynceMarkSvg
      animated={animated}
      variant={variant}
      className={cn("shrink-0", sizes[size], className)}
    />
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display tracking-tight text-foreground", className)}>
      Covalynce
    </span>
  );
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  tagline,
  className,
  href,
  onClick,
  animated = false,
  markVariant = "adaptive",
}: {
  size?: keyof typeof sizes;
  showWordmark?: boolean;
  tagline?: string;
  className?: string;
  href?: string;
  onClick?: () => void;
  animated?: boolean;
  /** tile = obsidian favicon tile — ideal for collapsed sidebar / small sizes */
  markVariant?: "adaptive" | "tile" | "neon";
}) {
  const inner = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <CovalynceMark size={size} animated={animated} variant={markVariant} />
      {showWordmark && (
        <div className="min-w-0 text-left">
          <BrandWordmark
            className={size === "sm" || size === "xs" ? "text-sm" : "text-base"}
          />
          {tagline && (
            <p className="truncate text-[11px] text-muted-foreground">{tagline}</p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="transition-opacity hover:opacity-90">
        {inner}
      </Link>
    );
  }
  return inner;
}

/** @deprecated Use CovalynceMark */
export function BrandMark({
  className,
  size = "md",
  variant = "adaptive",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "adaptive" | "tile" | "neon";
}) {
  const map = { sm: "sm" as const, md: "md" as const, lg: "lg" as const };
  return <CovalynceMark size={map[size]} className={className} variant={variant} />;
}
