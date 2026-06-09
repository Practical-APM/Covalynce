"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PROVIDER_BRANDS,
  ProviderBrandLogo,
} from "@/components/landing/provider-brand-logo";
import { LandingSection } from "@/components/landing/landing-section";
import { LANDING } from "@/lib/landing-copy";
import { cn } from "@/lib/utils";

const statusLabel = {
  live: { text: "Billing sync", className: "text-foreground border-foreground/20 bg-foreground/5" },
  gateway: { text: "Gateway proxy", className: "text-primary border-primary/30 bg-primary/5" },
  roadmap: { text: "Roadmap", className: "text-muted-foreground border-border bg-transparent" },
};

export function LandingLogos() {
  const [active, setActive] = useState<string | null>(PROVIDER_BRANDS[0]?.id ?? null);
  const selected = PROVIDER_BRANDS.find((p) => p.id === active);

  return (
    <LandingSection
      id="integrations"
      eyebrow={LANDING.integrationsEyebrow}
      title={LANDING.integrationsTitle}
      lead={LANDING.integrationsLead}
      border="y"
      className="bg-card/50 py-16 sm:py-24"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROVIDER_BRANDS.map((p) => {
          const status = statusLabel[p.status];
          const description = p.status === "live"
            ? "Automated billing API synchronization."
            : p.status === "gateway"
              ? "Request routing and model spending attribution."
              : "Planned provider integration on the roadmap.";
          const isActive = active === p.id;

          return (
            <motion.button
              type="button"
              key={p.id}
              onClick={() => setActive(p.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "group flex flex-col justify-between border bg-card p-5 h-36 rounded-[var(--radius)] text-left transition-colors",
                isActive ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <ProviderBrandLogo id={p.id} className="size-8 shrink-0" />
                  <span className="font-semibold text-sm text-foreground">{p.name}</span>
                </div>
                <span className={cn("text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--radius)] border", status.className)}>
                  {status.text}
                </span>
              </div>
              <div className="border-t border-border/40 pt-3 mt-3">
                <p className="text-xs text-muted-foreground leading-normal">
                  {description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-[var(--radius)] border border-primary/25 bg-primary/5 px-5 py-4"
        >
          <p className="text-sm font-medium text-foreground">
            {selected.name} — {statusLabel[selected.status].text}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {selected.status === "live"
              ? "Connect billing credentials; Covalynce syncs usage on a 15-minute schedule."
              : selected.status === "gateway"
                ? "Route Azure or Bedrock traffic through the gateway for per-project attribution today."
                : "On the roadmap — join the waitlist via Enterprise editions."}
          </p>
        </motion.div>
      )}
    </LandingSection>
  );
}
