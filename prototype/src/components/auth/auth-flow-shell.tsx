"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

interface AuthFlowShellProps {
  children: React.ReactNode;
  headline?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  maxWidth?: "md" | "lg";
  className?: string;
}

export function AuthFlowShell({
  children,
  headline = "Explore Community Edition free",
  description = "Create a workspace and connect providers—or load sample data and explore solo.",
  backHref = "/",
  backLabel = "Home",
  maxWidth = "lg",
  className,
}: AuthFlowShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <header className="border-b border-border bg-background">
        <div
          className={cn(
            "mx-auto flex h-14 items-center justify-between px-4 sm:px-6",
            maxWidth === "lg" ? "max-w-3xl" : "max-w-2xl"
          )}
        >
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
          <BrandLogo size="sm" href="/" showWordmark={false} className="sm:hidden" />
          <BrandLogo size="sm" href="/" showWordmark className="hidden sm:flex" />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
        <aside className="hidden border-r border-border bg-muted/30 px-10 py-12 lg:flex lg:w-[42%] lg:flex-col lg:justify-between">
          <div>
            <BrandLogo size="lg" showWordmark tagline="AI spend control" animated />
            <h1 className="mt-10 max-w-md text-3xl font-semibold tracking-tight text-balance">
              {headline}
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "Guided setup with tooltips on every field",
              "Product tour available before you connect data",
              "Help Center built into the product",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <main
          className={cn(
            "flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-12",
            maxWidth === "lg" ? "lg:px-12" : ""
          )}
        >
          <div
            className={cn(
              "mx-auto w-full",
              maxWidth === "lg" ? "max-w-lg" : "max-w-md"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
