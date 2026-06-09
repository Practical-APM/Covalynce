import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { HelpTip } from "@/components/help-tip";

interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  trend?: number;
  help?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  sublabel,
  trend,
  help,
  className,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div className={cn("surface-panel p-5", className)}>
      <div className="flex items-center gap-1.5">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        {help && <HelpTip content={help} />}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {trend !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              isPositive && "text-warning",
              isNegative && "text-success",
              !isPositive && !isNegative && "text-muted-foreground"
            )}
          >
            {isPositive ? (
              <TrendingUp className="size-3" />
            ) : isNegative ? (
              <TrendingDown className="size-3" />
            ) : null}
            {isPositive ? "+" : ""}
            {trend.toFixed(1)}% vs last month
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
