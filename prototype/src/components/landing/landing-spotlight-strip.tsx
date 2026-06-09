"use client";

import { motion } from "framer-motion";
import { CAPABILITIES } from "@/lib/landing-copy";
import { DiagramByType } from "@/components/landing/explainer-diagrams";
import { HorizontalScrollStrip } from "@/components/landing/landing-scroll-fx";

export function LandingSpotlightStrip() {
  return (
    <section className="border-y border-border/70 bg-muted/15 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="landing-eyebrow text-foreground/70">Explore</p>
        <h2 className="landing-headline mt-2 text-2xl sm:text-3xl">
          Drag through the platform
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Each card is interactive — hover and scroll to preview how Covalynce answers a real finance question.
        </p>

        <div className="mt-8">
          <HorizontalScrollStrip label="Drag or scroll">
            {CAPABILITIES.map((cap, i) => (
              <motion.article
                key={cap.title}
                className="w-[min(85vw,320px)] shrink-0 snap-start rounded-[var(--radius)] border border-border bg-card p-5"
                whileHover={{ y: -6, borderColor: "var(--primary)" }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
              >
                <h3 className="font-display text-lg tracking-tight">{cap.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {cap.outcome}
                </p>
                <div className="mt-4 flex min-h-[140px] items-center justify-center rounded-[var(--radius)] border border-border/60 bg-background/50 p-3">
                  <DiagramByType type={cap.diagram} />
                </div>
              </motion.article>
            ))}
          </HorizontalScrollStrip>
        </div>
      </div>
    </section>
  );
}
