import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  tip: {
    icon: Lightbulb,
    className: "border-foreground/12 bg-foreground/4",
    iconClass: "text-foreground/70",
  },
  note: {
    icon: Info,
    className: "border-border bg-muted/50",
    iconClass: "text-muted-foreground",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-500/25 bg-amber-500/6",
    iconClass: "text-amber-700 dark:text-amber-400",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-500/25 bg-emerald-500/6",
    iconClass: "text-emerald-700 dark:text-emerald-400",
  },
};

interface CalloutProps {
  variant?: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({
  variant = "note",
  title,
  children,
  className,
}: CalloutProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3.5 text-sm",
        config.className,
        className
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", config.iconClass)} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-foreground">{title}</p>}
        <div
          className={cn(
            "text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline-offset-4 [&_a]:hover:underline",
            title && "mt-1"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
