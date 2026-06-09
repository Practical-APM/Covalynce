"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  GETTING_STARTED_STEPS,
  loadGettingStarted,
  saveGettingStarted,
  type GettingStartedState,
} from "@/lib/getting-started";

export function GettingStartedPanel() {
  const pathname = usePathname();
  const [state, setState] = useState<GettingStartedState | null>(() =>
    loadGettingStarted()
  );
  const [expanded, setExpanded] = useState(true);

  if (pathname.startsWith("/help")) return null;
  if (!state || state.dismissed) return null;

  const completedCount = state.completed.length;
  const total = GETTING_STARTED_STEPS.length;
  const progress = (completedCount / total) * 100;

  if (completedCount >= total) return null;

  const nextStep = GETTING_STARTED_STEPS.find(
    (s) => !state.completed.includes(s.id)
  );

  function dismiss() {
    const next = { ...state!, dismissed: true };
    saveGettingStarted(next);
    setState(next);
  }

  return (
    <div className="mb-6 min-w-0 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <Sparkles className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Getting started</p>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{total} complete
            {nextStep ? ` · Next: ${nextStep.title}` : ""}
          </p>
          <Progress value={progress} className="mt-2 h-1 max-w-xs" />
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? "Collapse checklist" : "Expand checklist"}
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
        <Link
          href="/help/getting-started"
          className="hidden text-xs font-medium text-foreground underline-offset-4 hover:underline sm:inline"
        >
          Guide
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={dismiss}
          aria-label="Dismiss getting started"
        >
          <X className="size-4" />
        </Button>
      </div>
      {expanded && (
        <ul className="border-t border-border">
          {GETTING_STARTED_STEPS.map((step) => {
            const done = state.completed.includes(step.id);
            return (
              <li key={step.id}>
                <Link
                  href={step.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50",
                    done && "opacity-60"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                      done
                        ? "border-foreground bg-foreground text-background"
                        : "border-border"
                    )}
                  >
                    {done ? <Check className="size-3" /> : null}
                  </span>
                  <span
                    className={cn(
                      "truncate font-medium",
                      done && "line-through text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
