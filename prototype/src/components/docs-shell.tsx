"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DocRelated } from "@/components/docs-parts";
import {
  docsNav,
  flatDocsNav,
  getDocNeighbors,
  pageRelated,
} from "@/lib/help-content";
import { cn } from "@/lib/utils";

export { docsNav };

export function DocsShell({
  children,
  title,
  description,
  readTime,
  related,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  readTime?: string;
  related?: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const { prev, next } = getDocNeighbors(pathname);
  const relatedLinks =
    related ?? pageRelated[pathname] ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-1 sm:px-0">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2" aria-label="Help">
            {docsNav.map((group) => (
              <div key={group.title} className="mb-6 last:mb-0">
                <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {group.title}
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/help" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-lg px-2 py-2 transition-colors",
                            active
                              ? "bg-foreground/6 font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <span className="flex items-center gap-2 text-sm">
                            {Icon && <Icon className="size-3.5 shrink-0 opacity-70" />}
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="mt-0.5 block pl-[22px] text-[11px] leading-snug text-muted-foreground/90">
                              {item.description}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 flex-1 pb-24 lg:pb-20">
          {title && (
            <header className="doc-page-header">
              <p className="doc-breadcrumb">
                <Link href="/help">Help</Link>
                <ChevronRight className="size-3.5" aria-hidden />
                <span>{title}</span>
              </p>
              <h1>{title}</h1>
              {description && <p className="doc-lead">{description}</p>}
              {readTime && (
                <p className="mt-3 text-xs text-muted-foreground">{readTime} read</p>
              )}
            </header>
          )}

          <div className="prose-docs">{children}</div>

          {relatedLinks.length > 0 && (
            <DocRelated links={relatedLinks} />
          )}

          {(prev || next) && (
            <nav
              className="mt-12 grid gap-3 border-t border-border/70 pt-8 sm:grid-cols-2"
              aria-label="Continue reading"
            >
              {prev ? (
                <Link href={prev.href} className="doc-pager doc-pager-prev">
                  <ChevronLeft className="size-4 shrink-0" />
                  <span>
                    <span className="doc-pager-label">Previous</span>
                    <span className="doc-pager-title">{prev.label}</span>
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {next && (
                <Link href={next.href} className="doc-pager doc-pager-next">
                  <span>
                    <span className="doc-pager-label">Next</span>
                    <span className="doc-pager-title">{next.label}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0" />
                </Link>
              )}
            </nav>
          )}
        </article>
      </div>

      {/* Mobile nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-4 py-2 backdrop-blur-md lg:hidden">
        <select
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          value={flatDocsNav.find(
            (item) =>
              pathname === item.href ||
              (item.href !== "/help" && pathname.startsWith(item.href))
          )?.href ?? "/help"}
          onChange={(e) => {
            if (e.target.value) window.location.href = e.target.value;
          }}
          aria-label="Jump to help section"
        >
          {docsNav.map((group) => (
            <optgroup key={group.title} label={group.title}>
              {group.items.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}
