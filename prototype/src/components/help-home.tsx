"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Callout } from "@/components/callout";
import { HelpHeroVisual } from "@/components/docs/doc-illustrations";
import { DocCardGrid } from "@/components/docs-parts";
import {
  flatDocsNav,
  helpByRole,
  helpTasks,
} from "@/lib/help-content";

const popular = [
  { href: "/help/features/providers", label: "How do I connect OpenAI?" },
  { href: "/help/features/budgets", label: "What is budget utilization?" },
  { href: "/help/features/gateway", label: "When should I use the Gateway?" },
  { href: "/help/editions", label: "Community vs Enterprise?" },
];

export function HelpHome() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!q) return [];
    return flatDocsNav.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <>
      <HelpHeroVisual />

      <Callout variant="tip" title="New here?">
        Start with{" "}
        <Link href="/help/getting-started" className="font-medium text-foreground underline-offset-4 hover:underline">
          Getting started
        </Link>{" "}
        — about five minutes to a live Overview with sample or connected data.
      </Callout>

      <div className="doc-search mt-8">
        <Search className="doc-search-icon" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs — providers, gateway, budgets…"
          className="doc-search-input"
          aria-label="Search help documentation"
        />
      </div>

      {q && (
        <div className="mt-4">
          {searchResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">No matches. Try &ldquo;gateway&rdquo; or &ldquo;budget&rdquo;.</p>
          ) : (
            <ul className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card">
              {searchResults.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.group}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!q && (
        <>
          <h2 className="doc-section-title mt-10">I want to…</h2>
          <DocCardGrid
            items={helpTasks.map((t) => ({
              href: t.href,
              title: t.title,
              description: t.description,
              meta: t.time,
            }))}
          />

          <h2 className="doc-section-title mt-12">By role</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {helpByRole.map((block) => (
              <div key={block.role} className="rounded-xl border border-border/80 bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {block.role}
                </p>
                <ul className="mt-3 space-y-2">
                  {block.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/85 transition-colors hover:text-foreground hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="doc-section-title mt-12">Popular questions</h2>
          <ul className="mt-3 divide-y divide-border/60 rounded-xl border border-border/80 bg-card">
            {popular.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-muted/40"
                >
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="doc-section-title mt-12">In the app</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every major page links here from <strong className="font-medium text-foreground">Learn more</strong> in
            the header. Hover sidebar items for a one-line summary. Metric tooltips on Overview explain utilization
            and sync health inline.
          </p>
        </>
      )}
    </>
  );
}
