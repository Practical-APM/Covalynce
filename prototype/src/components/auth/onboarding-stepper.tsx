"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function OnboardingStepper({
  steps,
  current,
}: {
  steps: OnboardingStep[];
  current: number;
}) {
  const reduce = useReducedMotion();
  const progress = ((current - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          Step {current} of {steps.length}
        </span>
        <span>{Math.round((current / steps.length) * 100)}%</span>
      </div>
      <div className="relative h-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-foreground"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="mt-6 flex justify-between gap-2">
        {steps.map((s) => {
          const done = s.id < current;
          const active = s.id === current;
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-2 text-center",
                !active && !done && "opacity-50"
              )}
            >
              <motion.div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-colors",
                  done && "border-foreground bg-foreground text-background",
                  active && !done && "border-foreground bg-background text-foreground",
                  !active && !done && "border-border bg-background"
                )}
                animate={
                  active && !reduce
                    ? { scale: [1, 1.06, 1] }
                    : { scale: 1 }
                }
                transition={
                  active
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
              >
                {done ? (
                  <Check className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </motion.div>
              <span
                className={cn(
                  "hidden text-[11px] font-medium sm:block",
                  active && "text-foreground",
                  done && "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
