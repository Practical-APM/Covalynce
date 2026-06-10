"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatedProductPreview } from "@/components/landing/animated-product-preview";
import { LandingButton, LandingTextLink } from "@/components/landing/landing-button";
import { LANDING } from "@/lib/landing-copy";

const ease = [0.16, 1, 0.3, 1] as const;

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const previewY = useTransform(scrollYProgress, [0, 1], [0, 56]);

  return (
    <section
      ref={sectionRef}
      className="landing-ink-adaptive ledger-lines relative overflow-hidden border-b border-border/70"
    >
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-16 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="flex items-baseline gap-4">
              <span className="ledger-index">§ 00</span>
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {LANDING.eyebrow}
              </span>
            </div>

            <h1 className="landing-headline mt-7 text-foreground">
              {LANDING.headline}{" "}
              <span className="landing-headline-accent block">{LANDING.headlineAccent}</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/70 sm:text-lg">
              {LANDING.subhead}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <LandingButton href="/onboarding">
                {LANDING.ctaPrimary}
                <ArrowRight className="size-4" />
              </LandingButton>
              <LandingTextLink
                href="/dashboard"
                className="text-sm font-semibold text-foreground/70 hover:text-foreground"
              >
                {LANDING.ctaSecondary}
              </LandingTextLink>
            </div>

            <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Works with <span className="text-foreground/80">OpenAI</span> ·{" "}
              <span className="text-foreground/80">Anthropic</span> ·{" "}
              <span className="text-foreground/80">Gemini</span>
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            style={reduce ? undefined : { y: previewY }}
            className="border border-border bg-card p-1.5 sm:p-2"
          >
            <AnimatedProductPreview size="large" />
          </motion.div>
        </div>
      </div>

      {/* Proof ledger: every value is documented in the repo */}
      <div className="relative border-t border-border/70">
        <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border/60 px-5 sm:grid-cols-2 sm:divide-y-0 sm:divide-x sm:px-8 lg:grid-cols-4">
          {LANDING.trustItems.map((item, i) => (
            <motion.div
              key={item.label}
              className="flex flex-col gap-1 py-5 sm:px-6 sm:py-6 first:sm:pl-0 last:sm:pr-0"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease }}
            >
              <dt className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {item.label}
                </span>
                <span aria-hidden className="ledger-leader" />
              </dt>
              <dd>
                <span className="ledger-value text-sm text-foreground">{item.value}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {item.detail}
                </span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
