"use client";

import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";

export function PrototypeBanner() {
  const { apiMode } = useAuth();

  return (
    <div className="flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2 text-center text-sm">
      <Info className="size-4 shrink-0 text-primary" />
      <span>
        {apiMode
          ? "Live data — showing metrics from your organization"
          : "Demo data — sample metrics for exploring the product"}
      </span>
      <Badge variant="outline" className="text-[10px]">
        {apiMode ? "Live" : "Demo"}
      </Badge>
    </div>
  );
}
