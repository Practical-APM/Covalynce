import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type LandingSectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  align?: "left" | "center";
  border?: "none" | "top" | "y";
};

export function LandingSection({
  id,
  eyebrow,
  title,
  lead,
  children,
  className,
  innerClassName,
  align = "center",
  border = "none",
}: LandingSectionProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

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
        {(eyebrow || title || lead) && (
          <header className={cn("max-w-2xl", alignClass, align === "center" && "mb-14")}>
            {eyebrow && (
              <p className="landing-eyebrow text-foreground/70">{eyebrow}</p>
            )}
            {title && (
              <h2 className={cn("landing-headline", eyebrow && "mt-3")}>{title}</h2>
            )}
            {lead && (
              <p className={cn("landing-subhead", align === "center" && "mx-auto")}>{lead}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
