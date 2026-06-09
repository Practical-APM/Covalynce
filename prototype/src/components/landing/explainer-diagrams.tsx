"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  Layers,
  LayoutDashboard,
  Shield,
  Split,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import {
  AnimatedBar,
  DiagramAnimate,
  DiagramItem,
  FlowPulse,
} from "@/components/landing/landing-diagram-shell";

export function DiagramFragmentation() {
  const sources = [
    { label: "Vendor console A", offset: -6 },
    { label: "Vendor console B", offset: 4 },
    { label: "Vendor console C", offset: -3 },
  ];

  return (
    <DiagramAnimate className="space-y-5 text-center">
      <div className="relative flex flex-wrap items-center justify-center gap-3">
        {sources.map((s, i) => (
          <DiagramItem key={s.label} delay={i * 0.08}>
            <motion.div
              className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-3 py-2 text-[10px] font-medium text-muted-foreground"
              animate={{ y: [s.offset, -s.offset, s.offset] }}
              transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            >
              {s.label}
            </motion.div>
          </DiagramItem>
        ))}
      </div>

      <DiagramItem delay={0.2}>
        <div className="flex justify-center">
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="size-4 text-muted-foreground" />
          </motion.div>
        </div>
      </DiagramItem>

      <DiagramItem delay={0.28}>
        <div className="mx-auto flex max-w-[220px] items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 shadow-sm">
          <BrandMark size="sm" className="size-6 rounded text-[10px]" />
          <span className="text-sm font-semibold">One Overview</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Unified ledger</p>
      </DiagramItem>
    </DiagramAnimate>
  );
}

export function DiagramAttribution() {
  const layers = [
    { label: "Organization", icon: LayoutDashboard, n: 1 },
    { label: "Team", icon: Users, n: 2 },
    { label: "User", icon: Users, n: 3 },
    { label: "Model · Provider", icon: Split, n: 4 },
  ];

  return (
    <DiagramAnimate className="space-y-2">
      {layers.map((l, i) => {
        const Icon = l.icon;
        return (
          <DiagramItem key={l.label} delay={i * 0.1}>
            <motion.div
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2"
              whileHover={{ x: 4, borderColor: "var(--primary)" }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded bg-foreground/10 font-mono text-[10px] font-semibold">
                {l.n}
              </span>
              <Icon className="size-3.5 text-primary/70" strokeWidth={1.75} />
              <span className="text-[11px] font-semibold uppercase tracking-wide">{l.label}</span>
              {i === layers.length - 1 && (
                <Layers className="ml-auto size-3.5 text-muted-foreground" />
              )}
            </motion.div>
          </DiagramItem>
        );
      })}
    </DiagramAnimate>
  );
}

export function DiagramBudgets() {
  const rows = [
    { label: "Platform", pct: 72, tone: "primary" as const },
    { label: "R&D", pct: 48, tone: "primary" as const },
    { label: "Support bots", pct: 91, tone: "warning" as const },
  ];

  const toneClass = {
    primary: "bg-primary/80",
    warning: "bg-warning",
  };

  return (
    <DiagramAnimate className="space-y-3">
      {rows.map((row, i) => (
        <DiagramItem key={row.label} delay={i * 0.12}>
          <div>
            <div className="mb-1 flex justify-between text-[10px] font-medium">
              <span>{row.label}</span>
              <span className="text-muted-foreground">{row.pct}% of cap</span>
            </div>
            <div className="h-1.5">
              <AnimatedBar
                width={row.pct}
                delay={0.15 + i * 0.1}
                className={toneClass[row.tone]}
              />
            </div>
          </div>
        </DiagramItem>
      ))}
      <DiagramItem delay={0.45}>
        <motion.p
          className="flex items-center gap-2 border-t border-border/50 pt-3 text-[10px] font-semibold uppercase tracking-wide text-warning"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertTriangle className="size-3" />
          Alert at 80%
        </motion.p>
      </DiagramItem>
    </DiagramAnimate>
  );
}

export function DiagramGateway() {
  const reduce = useReducedMotion();

  return (
    <DiagramAnimate className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-1">
      <DiagramItem delay={0}>
        <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border/70 bg-background px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Your app
          </span>
          <span className="font-mono text-[9px] text-foreground">gk_••••</span>
        </div>
      </DiagramItem>

      <FlowPulse className="hidden sm:inline-flex" />

      <DiagramItem delay={0.12}>
        <motion.div
          className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-primary/35 bg-primary/5 px-5 py-3"
          animate={reduce ? undefined : { boxShadow: ["0 0 0 0 rgba(102,252,241,0)", "0 0 0 6px rgba(102,252,241,0.08)", "0 0 0 0 rgba(102,252,241,0)"] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-foreground">
            <BrandMark size="sm" variant="neon" className="size-6 rounded text-[10px]" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">Gateway</span>
        </motion.div>
      </DiagramItem>

      <FlowPulse className="hidden sm:inline-flex" />

      <DiagramItem delay={0.24}>
        <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border/70 bg-background px-4 py-3">
          <Shield className="size-5 text-primary/80" strokeWidth={1.5} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Policy · Route
          </span>
        </div>
      </DiagramItem>
    </DiagramAnimate>
  );
}

export function DiagramByType({
  type,
}: {
  type: "visibility" | "attribution" | "budgets" | "gateway";
}) {
  switch (type) {
    case "visibility":
      return <DiagramFragmentation />;
    case "attribution":
      return <DiagramAttribution />;
    case "budgets":
      return <DiagramBudgets />;
    case "gateway":
      return <DiagramGateway />;
  }
}
