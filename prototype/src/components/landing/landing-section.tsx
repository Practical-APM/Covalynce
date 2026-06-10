import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type LandingSectionProps = {
  id?: string;
  /** Ledger entry index, e.g. "01" — rendered in mono before the eyebrow */
  index?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  headerClassName?: string;
  border?: "none" | "top" | "y";
};

/**
 * Ledger section: indexed header line with a hairline rule, left-aligned
 * headline, optional lead. Structure comes from rules, not boxes.
 */
export function LandingSection({
  id,
  index,
  eyebrow,
  title,
  lead,
  children,
  className,
  innerClassName,
  headerClassName,
  border = "none",
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 py-20 sm:py-28",
        border === "top" && "border-t border-border/70",
        border === "y" && "border-y border-border/70",
        className
      )}
    >
      <div className={cn("mx-auto max-w-7xl px-5 sm:px-8", innerClassName)}>
        {(index || eyebrow || title || lead) && (
          <header className={cn("mb-12 sm:mb-16", headerClassName)}>
            {(index || eyebrow) && (
              <div className="flex items-baseline gap-4">
                {index && <span className="ledger-index">{index}</span>}
                {eyebrow && (
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {eyebrow}
                  </span>
                )}
                <span aria-hidden className="h-px flex-1 self-center bg-border" />
              </div>
            )}
            {title && (
              <h2 className={cn("landing-headline max-w-3xl", (index || eyebrow) && "mt-6")}>
                {title}
              </h2>
            )}
            {lead && (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {lead}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
