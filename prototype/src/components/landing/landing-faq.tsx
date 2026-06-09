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
      eyebrow={LANDING.faqEyebrow}
      title={LANDING.faqTitle}
      align="center"
      border="top"
      className="py-16 sm:py-24 bg-card/5"
    >
      <div className="mx-auto max-w-3xl divide-y divide-border border-y border-border">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left hover:text-primary transition-colors"
              >
                <span className="text-sm sm:text-base font-semibold leading-snug text-foreground">
                  {item.q}
                </span>
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center border border-border text-[10px] font-bold transition-all duration-300 rounded-none bg-card",
                    isOpen && "border-primary text-primary bg-primary/5 rotate-180"
                  )}
                  aria-hidden
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
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-sm leading-relaxed text-muted-foreground pr-8">
                      {item.a}
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
