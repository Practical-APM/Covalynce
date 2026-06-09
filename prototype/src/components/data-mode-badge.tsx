"use client";

import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DataModeBadge() {
  const { apiMode } = useAuth();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant="outline"
            className="h-6 cursor-default border-border px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {apiMode ? "Live data" : "Demo"}
          </Badge>
        }
      />
      <TooltipContent side="bottom" className="max-w-xs">
        {apiMode
          ? "Metrics come from your connected organization and providers."
          : "Sample data for exploring the product. Sign in with API mode for real metrics."}
      </TooltipContent>
    </Tooltip>
  );
}
