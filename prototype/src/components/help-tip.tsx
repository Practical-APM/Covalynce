"use client";

import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTipProps {
  content: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  label?: string;
}

export function HelpTip({
  content,
  className,
  side = "top",
  label = "More information",
}: HelpTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <CircleHelp className="size-3.5" strokeWidth={2} />
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-left leading-snug">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

interface LabelWithHelpProps {
  label: string;
  help: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function LabelWithHelp({
  label,
  help,
  htmlFor,
  className,
}: LabelWithHelpProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
      ) : (
        <span className="text-sm font-medium">{label}</span>
      )}
      <HelpTip content={help} label={`About ${label}`} />
    </span>
  );
}
