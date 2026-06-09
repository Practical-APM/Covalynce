"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dailySpend, providers } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";

const CHART_PRIMARY = "var(--chart-1)";
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const PROVIDER_COLOR_INDEX: Record<string, number> = {
  OPENAI: 1,
  openai: 1,
  ANTHROPIC: 2,
  anthropic: 2,
  GEMINI: 3,
  gemini: 3,
};

function providerColor(name: string, index = 0) {
  const idx = PROVIDER_COLOR_INDEX[name] ?? index % CHART_COLORS.length;
  return CHART_COLORS[idx] ?? CHART_PRIMARY;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function SpendOverTimeChart({
  data,
  empty,
}: {
  data?: { date: string; spend: number; requests?: number }[];
  empty?: boolean;
}) {
  if (empty || (data && data.length === 0)) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No spend data for this period yet.
      </div>
    );
  }

  const chartData = (data ?? dailySpend).map((d) => ({
    date: d.date.length > 10 ? d.date.slice(5) : d.date,
    spend: d.spend,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.2} />
            <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground"
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={48}
          className="fill-muted-foreground"
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="spend"
          stroke={CHART_PRIMARY}
          strokeWidth={2}
          fill="url(#spendGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ProviderPieChart({
  data,
  empty,
}: {
  data?: { name: string; value: number; fill?: string }[];
  empty?: boolean;
}) {
  if (empty || (data && data.length === 0)) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Connect a provider to see distribution.
      </div>
    );
  }

  const providerChartData =
    data ??
    providers.map((p, i) => ({
      name: p.displayName,
      value: p.monthlySpend,
      fill: providerColor(p.name, i),
    }));

  const withColors = providerChartData.map((p, i) => ({
    ...p,
    fill: p.fill ?? providerColor(p.name, i),
  }));

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width="50%" height={200}>
        <PieChart>
          <Pie
            data={withColors}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
          >
            {withColors.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            content={<ChartTooltip />}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {withColors.map((p) => (
          <div key={p.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: p.fill }}
              />
              <span>{p.name}</span>
            </div>
            <span className="font-mono text-muted-foreground">
              {formatCurrency(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamSpendChart({
  data,
}: {
  data: { name: string; spend: number; budget: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/60" />
        <XAxis
          type="number"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          content={<ChartTooltip />}
        />
        <Bar dataKey="spend" fill={CHART_PRIMARY} radius={[0, 4, 4, 0]} />
        <Bar
          dataKey="budget"
          fill="var(--muted)"
          radius={[0, 4, 4, 0]}
          opacity={0.55}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
