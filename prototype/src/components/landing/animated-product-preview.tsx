"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  LayoutDashboard,
  Plug,
  Wallet,
} from "lucide-react";
import { useRef } from "react";
import { CovalynceMark } from "@/components/brand-logo";
import { PROVIDER_ACCENT_COLORS, type ProviderBrandId } from "@/components/landing/provider-brand-logo";
import { cn } from "@/lib/utils";

const miniNav = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: BarChart3, label: "Usage", active: false },
  { icon: Plug, label: "Providers", active: false },
  { icon: Wallet, label: "Budgets", active: false },
];

const providers: { id: ProviderBrandId; name: string; share: number }[] = [
  { id: "openai", name: "OpenAI", share: 44 },
  { id: "anthropic", name: "Anthropic", share: 31 },
  { id: "gemini", name: "Gemini", share: 25 },
];

const trend = [38, 52, 46, 58, 50, 64, 55, 62, 48, 70, 58, 66];

export function AnimatedProductPreview({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "large";
  showLink?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const large = size === "large";

  return (
    <div ref={ref} className={cn("w-full overflow-hidden rounded-xl bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <CovalynceMark size="xs" className="size-6" animated />
          <span className="text-sm font-medium">Overview</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Month to date
          </span>
          <span className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sample data
          </span>
        </div>
      </div>

      <div className={cn("flex", large ? "min-h-[380px]" : "min-h-[300px]")}>
        <nav className="hidden w-32 flex-col gap-0.5 border-r border-border/60 p-2 md:flex">
          {miniNav.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium",
                  item.active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </div>
            );
          })}
        </nav>

        <div className={cn("flex-1 p-4 sm:p-5", large && "sm:p-6")}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Organization spend
              </p>
              <motion.p
                className={cn("font-semibold tabular-nums tracking-tight", large ? "text-3xl" : "text-2xl")}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                $48,290
              </motion.p>
            </div>
            <motion.p
              className="text-xs text-muted-foreground"
              initial={reduce ? false : { opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              +12% vs last month
            </motion.p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {providers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.45 }}
                className="rounded-lg border border-border/60 bg-background/80 p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: PROVIDER_ACCENT_COLORS[p.id] }}
                    aria-hidden
                  />
                  <span className="text-xs font-medium">{p.name}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">{p.share}%</span>
                </div>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: PROVIDER_ACCENT_COLORS[p.id] }}
                    initial={{ width: reduce ? `${p.share}%` : "0%" }}
                    animate={inView ? { width: `${p.share}%` } : {}}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-border/60 bg-background/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Daily trend
            </p>
            <div className={cn("mt-3 flex items-end gap-1", large ? "h-20" : "h-14")}>
              {trend.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/40"
                  initial={reduce ? false : { height: 0 }}
                  animate={inView ? { height: `${h}%` } : {}}
                  transition={{ delay: 0.45 + i * 0.025, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
