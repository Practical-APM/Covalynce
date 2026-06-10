"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQ_ITEMS, LANDING } from "@/lib/landing-copy";
import { LandingSection } from "@/components/landing/landing-section";
import { cn } from "@/lib/utils";

export function LandingFaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <LandingSection
      id="faq"
      index="§ 07"
      eyebrow={LANDING.faqEyebrow}
      title={LANDING.faqTitle}
      border="top"
    >
      <div className="max-w-3xl border-t-2 border-foreground/80">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-b border-border">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="grid w-full grid-cols-[3rem_1fr_auto] items-baseline gap-x-2 py-5 text-left transition-colors hover:bg-muted/40"
              >
                <span className="ledger-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-semibold leading-snug text-foreground sm:text-base">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "pr-1 font-mono text-base text-muted-foreground transition-colors",
                    isOpen && "text-foreground"
                  )}
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="grid grid-cols-[3rem_1fr] gap-x-2 pb-6 text-sm leading-relaxed text-muted-foreground">
                      <span aria-hidden />
                      <span className="pr-8">{item.a}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </LandingSection>
  );
}
