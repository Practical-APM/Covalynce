"use client";

import { ProviderBrandLogo } from "@/components/landing/provider-brand-logo";
import { cn } from "@/lib/utils";

function MiniSidebar({ active = "Overview" }: { active?: string }) {
  const items = ["Overview", "Providers", "Budgets", "Gateway", "Usage"];
  return (
    <div className="flex w-[4.5rem] shrink-0 flex-col gap-1 border-r border-border/60 bg-sidebar/80 py-3 pr-2 pl-2 sm:w-20">
      {items.map((item) => (
        <div
          key={item}
          className={cn(
            "rounded px-1.5 py-1 text-[8px] font-medium leading-tight sm:text-[9px]",
            item === active
              ? "bg-primary/12 text-primary"
              : "text-muted-foreground"
          )}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-2.5 py-2 sm:px-3 sm:py-2.5">
      <p className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[9px]">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-foreground sm:text-base">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[8px] text-muted-foreground sm:text-[9px]">{sub}</p>
      )}
    </div>
  );
}

function BarChart({ heights }: { heights: number[] }) {
  return (
    <div className="flex h-20 items-end gap-1 sm:h-24 sm:gap-1.5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-primary/25 transition-colors"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function OverviewDashboardIllustration() {
  return (
    <div className="flex min-h-[11rem] overflow-hidden rounded-lg border border-border/60 bg-background">
      <MiniSidebar active="Overview" />
      <div className="min-w-0 flex-1 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold text-foreground sm:text-xs">Overview</p>
          <span className="rounded border border-border/70 bg-muted/50 px-2 py-0.5 text-[8px] text-muted-foreground">
            Month to date
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <MetricCard label="Total spend" value="$12,480" sub="+8% vs last mo." />
          <MetricCard label="Budget util." value="62%" sub="$20k cap" />
          <MetricCard label="Sync health" value="OK" sub="2m ago" />
        </div>
        <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 p-2.5">
          <p className="text-[8px] font-medium text-muted-foreground">Spend over time</p>
          <BarChart heights={[35, 42, 38, 55, 48, 62, 58, 70, 65, 72, 68, 80]} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/60 bg-card p-2">
            <p className="text-[8px] text-muted-foreground">Top model</p>
            <p className="text-[10px] font-medium">gpt-4o</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-2">
            <p className="text-[8px] text-muted-foreground">Top team</p>
            <p className="text-[10px] font-medium">Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProvidersIllustration() {
  const providers = [
    { id: "openai" as const, name: "OpenAI", status: "Connected" },
    { id: "anthropic" as const, name: "Anthropic", status: "Connected" },
    { id: "gemini" as const, name: "Gemini", status: "Syncing" },
  ];
  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-background p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold sm:text-xs">Providers</p>
        <span className="rounded bg-primary px-2 py-0.5 text-[8px] font-medium text-primary-foreground">
          + Connect
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {providers.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card p-2.5"
          >
            <ProviderBrandLogo id={p.id} className="size-7 sm:size-8" />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-medium">{p.name}</p>
              <p
                className={cn(
                  "text-[8px]",
                  p.status === "Connected"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                )}
              >
                {p.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetsIllustration() {
  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-background p-3 sm:p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-semibold sm:text-xs">Org monthly budget</p>
        <p className="font-mono text-[10px] tabular-nums text-muted-foreground">$20,000</p>
      </div>
      <div>
        <div className="flex justify-between text-[8px] text-muted-foreground">
          <span>$12,480 spent</span>
          <span className="font-medium text-foreground">62%</span>
        </div>
        <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[62%] rounded-full bg-primary" />
          <div
            className="absolute top-0 bottom-0 w-px bg-amber-500"
            style={{ left: "80%" }}
            title="80% threshold"
          />
        </div>
        <div className="mt-1 flex justify-between text-[7px] text-muted-foreground">
          <span>0%</span>
          <span className="text-amber-600 dark:text-amber-400">80% alert</span>
          <span>100%</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/60 bg-card p-2">
          <p className="text-[8px] text-muted-foreground">Team: Platform</p>
          <p className="font-mono text-[10px]">$4,200 / $6k</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-card p-2">
          <p className="text-[8px] text-muted-foreground">Alerts</p>
          <p className="text-[10px]">Slack · Email</p>
        </div>
      </div>
    </div>
  );
}

export function GatewayIllustration() {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-4">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4">
        <div className="w-full rounded-lg border border-border/70 bg-card p-3 text-center sm:w-auto sm:min-w-[5.5rem]">
          <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Your app</p>
          <p className="mt-1 font-mono text-[9px]">gk_••••</p>
        </div>
        <div className="hidden text-muted-foreground sm:block">→</div>
        <div className="w-full rounded-lg border-2 border-primary/30 bg-primary/5 p-3 text-center sm:w-auto sm:min-w-[6.5rem]">
          <p className="text-[8px] font-semibold uppercase tracking-wider text-primary">
            Covalynce Gateway
          </p>
          <p className="mt-1 text-[8px] text-muted-foreground">Log · Policy · Route</p>
        </div>
        <div className="hidden text-muted-foreground sm:block">→</div>
        <div className="flex gap-2">
          <ProviderBrandLogo id="openai" className="size-8" />
          <ProviderBrandLogo id="anthropic" className="size-8" />
        </div>
      </div>
      <div className="mt-3 rounded border border-dashed border-border/80 bg-muted/20 px-3 py-2 font-mono text-[8px] text-muted-foreground">
        POST /api/v1/gateway/v1/chat/completions
      </div>
    </div>
  );
}

export function AttributionDiagram() {
  const headers = [
    "X-Covalynce-Agent-Id: support-bot",
    "X-Covalynce-User-Id: jane@co.com",
    "X-Covalynce-Team-Id: platform",
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/70 bg-card p-3">
        <p className="text-[9px] font-medium text-muted-foreground">Request headers</p>
        <div className="mt-2 space-y-1">
          {headers.map((h) => (
            <code
              key={h}
              className="block rounded bg-muted/60 px-2 py-1 font-mono text-[8px] text-foreground sm:text-[9px]"
            >
              {h}
            </code>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-[9px] text-muted-foreground">
        <span className="rounded border border-border/70 bg-card px-2 py-1">Usage</span>
        <span>→</span>
        <span className="rounded border border-border/70 bg-card px-2 py-1">Teams</span>
        <span>→</span>
        <span className="rounded border border-border/70 bg-card px-2 py-1">Users</span>
      </div>
    </div>
  );
}

export function InsightsIllustration() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Optimization
        </p>
        <p className="mt-1 text-[10px] leading-snug text-foreground">
          Move summarization to gpt-4o-mini — est. $420/mo saved
        </p>
      </div>
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          Anomaly
        </p>
        <p className="mt-1 text-[10px] leading-snug text-foreground">
          User spend 3.2× above 7-day average — investigate agent key
        </p>
      </div>
    </div>
  );
}

export function PoliciesIllustration() {
  const rows = [
    { action: "Allow", target: "gpt-4o-mini", team: "Production" },
    { action: "Deny", target: "gpt-4o", team: "Interns" },
    { action: "Hard cap", target: "$500/day", team: "Sandbox" },
  ];
  return (
    <div className="overflow-hidden rounded-lg border border-border/70">
      <table className="w-full text-left text-[9px]">
        <thead>
          <tr className="border-b border-border/70 bg-muted/40">
            <th className="px-3 py-2 font-semibold text-muted-foreground">Action</th>
            <th className="px-3 py-2 font-semibold text-muted-foreground">Target</th>
            <th className="px-3 py-2 font-semibold text-muted-foreground">Scope</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.action + r.team} className="border-b border-border/50 last:border-0">
              <td className="px-3 py-2 font-medium text-foreground">{r.action}</td>
              <td className="px-3 py-2 font-mono text-[8px]">{r.target}</td>
              <td className="px-3 py-2 text-muted-foreground">{r.team}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GettingStartedIllustration() {
  const steps = [
    "Create org",
    "Connect provider",
    "First sync",
    "Set budget",
    "Gateway (opt.)",
  ];
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2 sm:flex-col sm:gap-1">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
              i < 3
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            )}
          >
            {i + 1}
          </div>
          <p className="text-[9px] font-medium text-foreground sm:text-center">{step}</p>
          {i < steps.length - 1 && (
            <div className="hidden h-px flex-1 bg-border sm:block sm:h-auto sm:w-px sm:flex-none sm:self-stretch sm:min-h-[2rem]" />
          )}
        </div>
      ))}
    </div>
  );
}

export function ConceptsHubDiagram() {
  const terms = ["Budget", "Gateway key", "Utilization", "Attribution", "Sync"];
  return (
    <div className="relative flex min-h-[10rem] items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-16 rounded-full border-2 border-primary/30 bg-primary/10 sm:size-20" />
        <p className="absolute text-[10px] font-semibold text-primary">Glossary</p>
      </div>
      {terms.map((term, i) => {
        const angle = (i / terms.length) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + Math.cos(angle) * 38;
        const y = 50 + Math.sin(angle) * 38;
        return (
          <span
            key={term}
            className="absolute rounded-full border border-border/80 bg-card px-2 py-1 text-[8px] font-medium shadow-sm sm:text-[9px]"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
          >
            {term}
          </span>
        );
      })}
    </div>
  );
}

export function HelpHeroVisual() {
  return (
    <div className="doc-hero-visual">
      <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
        <div className="lg:col-span-3">
          <OverviewDashboardIllustration />
        </div>
        <div className="flex flex-col gap-3 lg:col-span-2">
          <ProvidersIllustration />
          <GatewayIllustration />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Live UI previews — your theme and data will match what you see in the app
      </p>
    </div>
  );
}
