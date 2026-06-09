"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Database, Cpu, Shield, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { LANDING } from "@/lib/landing-copy";
import { AnimatedProductPreview } from "@/components/landing/animated-product-preview";

const tabs = [
  { id: "overview" as const, label: "Overview", icon: Database },
  { id: "usage" as const, label: "Usage Breakdown", icon: Cpu },
  { id: "budgets" as const, label: "Budgets & Alerts", icon: Shield },
  { id: "providers" as const, label: "Provider Breakdown", icon: Activity },
];

export function LandingProductBleed() {
  const [activeTab, setActiveTab] = useState<"overview" | "usage" | "budgets" | "providers">("overview");

  return (
    <section id="product" className="scroll-mt-20 border-b border-border/70 py-16 sm:py-24 lg:py-28 bg-card/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <p className="landing-eyebrow text-foreground/70">{LANDING.bleedEyebrow}</p>
            <h2 className="landing-headline mt-3 text-3xl sm:text-4xl leading-tight">
              {LANDING.bleedTitle}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              {LANDING.bleedLead}
            </p>
            <ul className="mt-8 flex flex-col gap-3.5">
              {LANDING.bleedPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-foreground/90">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-none border border-primary bg-primary/5 text-primary">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            {/* Interactive Tab Bar */}
            <nav className="flex flex-wrap border-b border-border/80">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                      active
                        ? "border-primary text-primary bg-card"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Content Display Window */}
            <div className="landing-panel bg-card min-h-[400px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col p-5 sm:p-6"
                >
                  {activeTab === "overview" && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ledger Consolidated Overview</span>
                        <span className="font-mono text-[10px] text-primary">LIVE STATUS</span>
                      </div>
                      <div className="mt-4 flex-1">
                        <AnimatedProductPreview size="large" className="border-0 bg-transparent p-0" />
                      </div>
                    </div>
                  )}

                  {activeTab === "usage" && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Model Token Consumption</span>
                        <span className="font-mono text-[10px] text-muted-foreground">1.84B TOKENS MTD</span>
                      </div>
                      <div className="mt-5 space-y-5 flex-1">
                        {[
                          { model: "gpt-4o", tokens: "842M tokens", share: 46, provider: "OpenAI" },
                          { model: "claude-3-5-sonnet", tokens: "570M tokens", share: 31, provider: "Anthropic" },
                          { model: "gemini-1.5-pro", tokens: "428M tokens", share: 23, provider: "Google" },
                        ].map((m) => (
                          <div key={m.model} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-mono font-medium">{m.model} <span className="text-[10px] text-muted-foreground">({m.provider})</span></span>
                              <span className="font-semibold text-foreground">{m.tokens} ({m.share}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-none overflow-hidden border border-border/40">
                              <div className="h-full bg-primary" style={{ width: `${m.share}%` }} />
                            </div>
                          </div>
                        ))}
                        <div className="mt-6 border-t border-border/60 pt-4 flex justify-between items-center text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><TrendingUp className="size-3.5 text-primary" /> Sample data — your usage appears here after connecting providers</span>
                          <span className="text-[9px] font-semibold uppercase tracking-wider border border-border px-1.5 py-0.5">Sample data</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "budgets" && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Team Threshold Caps & Warnings</span>
                        <span className="font-mono text-[10px] text-warning">ALERT CONFIGURATIONS</span>
                      </div>
                      <div className="mt-4 space-y-4 flex-1">
                        {[
                          { team: "Platform Engineering", spent: "$12,000", limit: "$15,000", pct: 80, state: "warning" },
                          { team: "R&D Agents Lab", spent: "$4,200", limit: "$5,000", pct: 84, state: "warning" },
                          { team: "Customer Success Automation", spent: "$2,840", limit: "$3,000", pct: 94, state: "critical" },
                          { team: "Marketing Personalization", spent: "$850", limit: "$2,000", pct: 42, state: "normal" },
                        ].map((t) => (
                          <div key={t.team} className="border border-border/60 p-3 bg-background/50 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-xs font-semibold text-foreground">{t.team}</span>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                                <span>{t.spent} of {t.limit} used</span>
                                <span>•</span>
                                <span>{t.pct}% of limit</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {t.state === "critical" && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-destructive bg-destructive/5 border border-destructive/20 px-2 py-0.5">
                                  <AlertTriangle className="size-3" /> Overrun Alert
                                </span>
                              )}
                              {t.state === "warning" && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-warning bg-warning/5 border border-warning/20 px-2 py-0.5">
                                  <AlertTriangle className="size-3" /> Approaching Cap
                                </span>
                              )}
                              {t.state === "normal" && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-foreground/5 border border-border px-2 py-0.5">
                                  Active
                                </span>
                              )}
                              <div className="w-24 h-1.5 bg-muted border border-border/20 rounded-none overflow-hidden hidden sm:block">
                                <div
                                  className={`h-full ${t.state === "critical" ? "bg-destructive" : t.state === "warning" ? "bg-warning" : "bg-primary"}`}
                                  style={{ width: `${t.pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "providers" && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Provider Cost Distribution</span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider border border-border px-1.5 py-0.5 text-muted-foreground">Sample data</span>
                      </div>
                      <div className="mt-5 space-y-4 flex-1">
                        {[
                          { provider: "OpenAI", cost: "$8,420", share: 58, models: "gpt-4o, gpt-4o-mini" },
                          { provider: "Anthropic", cost: "$3,840", share: 26, models: "claude-3-5-sonnet" },
                          { provider: "Google Gemini", cost: "$2,340", share: 16, models: "gemini-1.5-pro" },
                        ].map((p) => (
                          <div key={p.provider} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-foreground">{p.provider}</span>
                              <span className="font-mono font-semibold text-foreground">{p.cost} <span className="text-muted-foreground font-normal">({p.share}%)</span></span>
                            </div>
                            <div className="h-2 bg-muted rounded-none overflow-hidden border border-border/40">
                              <div className="h-full bg-primary" style={{ width: `${p.share}%` }} />
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono">{p.models}</p>
                          </div>
                        ))}
                        <div className="mt-4 border-t border-border/60 pt-4 flex justify-between items-center text-xs text-muted-foreground">
                          <span>Total this month (sample data)</span>
                          <span className="font-mono font-semibold text-foreground">$14,600</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
