"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  FileSpreadsheet,
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Plug,
  Wallet,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import {
  AnimatedBar,
  DiagramAnimate,
  DiagramItem,
  FlowPulse,
} from "@/components/landing/landing-diagram-shell";

const scatteredSources = [
  { icon: Monitor, label: "Vendor console", drift: -5 },
  { icon: FileSpreadsheet, label: "Spreadsheet", drift: 4 },
  { icon: MessageSquare, label: "Slack thread", drift: -3 },
];

/** Before/after: scattered consoles → unified Covalynce ledger */
export function DiagramBeforeAfter() {
  const reduce = useReducedMotion();
  const trend = [32, 48, 42, 58, 52, 68, 62, 74];

  return (
    <DiagramAnimate className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Today
        </p>
        <ul className="mt-3 space-y-2">
          {scatteredSources.map((s, i) => {
            const Icon = s.icon;
            return (
              <DiagramItem key={s.label} delay={i * 0.08}>
                <motion.li
                  className="flex items-center gap-2.5 rounded-lg border border-dashed border-border/80 bg-muted/30 px-3 py-2"
                  animate={reduce ? undefined : { x: [0, s.drift, 0] }}
                  transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                </motion.li>
              </DiagramItem>
            );
          })}
        </ul>
      </div>

      <DiagramItem delay={0.2} className="hidden sm:block">
        <motion.span
          className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-sm text-muted-foreground"
          animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden
        >
          →
        </motion.span>
      </DiagramItem>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
          With Covalynce
        </p>
        <DiagramItem delay={0.25}>
          <div className="mt-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <BrandMark size="sm" className="size-6 rounded text-[10px]" />
              <span className="text-sm font-medium">Overview</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">MTD</span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total spend</p>
                <motion.p
                  className="font-semibold tabular-nums"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  $48,290
                </motion.p>
              </div>
              <span className="rounded border border-border bg-muted/40 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                3 providers
              </span>
            </div>
            <div className="mt-3 h-1.5">
              <AnimatedBar width={68} delay={0.35} className="bg-foreground/70" />
            </div>
            <div className="mt-4 flex h-12 items-end gap-1">
              {trend.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/30"
                  initial={{ height: reduce ? `${h}%` : 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
          </div>
        </DiagramItem>
      </div>
    </DiagramAnimate>
  );
}

/** Connect → Overview → Guardrails pipeline */
export function DiagramFlowPipeline() {
  const nodes: {
    label: string;
    detail: string;
    icon: typeof Plug;
    accent: string;
    brand?: boolean;
  }[] = [
    {
      label: "Connect",
      detail: "Billing APIs",
      icon: Plug,
      accent: "border-border/70 bg-background",
    },
    {
      label: "Overview",
      detail: "Unified MTD ledger",
      icon: LayoutDashboard,
      accent: "border-primary/30 bg-primary/5",
      brand: true,
    },
    {
      label: "Control",
      detail: "Budgets & alerts",
      icon: Wallet,
      accent: "border-warning/30 bg-warning/5",
    },
  ];

  return (
    <DiagramAnimate className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
      {nodes.map((node, i) => {
        const Icon = node.icon;
        return (
          <div key={node.label} className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-4">
            <DiagramItem delay={i * 0.14} className="w-full flex-1">
              <motion.div
                className={`flex w-full flex-col items-center rounded-xl border px-4 py-5 text-center ${node.accent}`}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
              >
                {node.brand ? (
                  <div className="flex size-11 items-center justify-center rounded-xl bg-foreground">
                    <BrandMark size="sm" variant="neon" className="size-6 rounded text-[10px]" />
                  </div>
                ) : (
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-card">
                    <Icon className="size-5 text-primary" strokeWidth={1.5} />
                  </div>
                )}
                <p className="mt-3 font-display text-lg tracking-tight">{node.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{node.detail}</p>
              </motion.div>
            </DiagramItem>
            {i < nodes.length - 1 && (
              <FlowPulse className="hidden shrink-0 sm:inline-flex" />
            )}
          </div>
        );
      })}
    </DiagramAnimate>
  );
}
