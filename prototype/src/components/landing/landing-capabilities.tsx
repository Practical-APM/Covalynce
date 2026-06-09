"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DiagramByType } from "@/components/landing/explainer-diagrams";
import { CAPABILITIES, LANDING } from "@/lib/landing-copy";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function LandingCapabilities() {
  const reduce = useReducedMotion();

  return (
    <section id="platform" className="scroll-mt-20 border-t border-border/70 py-16 sm:py-24 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="max-w-3xl">
          <p className="landing-eyebrow text-foreground/70">Platform</p>
          <h2 className="landing-headline mt-3 text-3xl sm:text-4xl leading-tight">
            {LANDING.capabilitiesTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {LANDING.capabilitiesLead}
          </p>
        </header>

        <motion.div
          className="mt-14 grid gap-6 md:grid-cols-2"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {CAPABILITIES.map((cap, i) => (
            <motion.article
              key={cap.title}
              variants={fadeUp}
              custom={i}
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex flex-col justify-between rounded-[var(--radius)] border border-border bg-card p-6 sm:p-8 hover:border-primary/40"
            >
              <div>
                <h3 className="font-display text-2xl tracking-tight text-foreground">{cap.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{cap.body}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">{cap.outcome}</p>
              </div>
              <div className="mt-6 flex min-h-[168px] items-center justify-center rounded-[var(--radius)] border border-border/60 bg-background/50 p-4">
                <DiagramByType type={cap.diagram} />
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
