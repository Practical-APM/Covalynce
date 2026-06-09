import Link from "next/link";
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DocSteps({
  steps,
}: {
  steps: { title: string; body: ReactNode; time?: string }[];
}) {
  return (
    <ol className="doc-steps">
      {steps.map((step, i) => (
        <li key={step.title} className="doc-step">
          <span className="doc-step-num" aria-hidden>
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="font-medium text-foreground">{step.title}</p>
              {step.time && (
                <span className="text-xs text-muted-foreground">{step.time}</span>
              )}
            </div>
            <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DocInAppLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      className="doc-in-app-link group"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span>{children}</span>
      {external ? (
        <ExternalLink className="size-3.5 opacity-60" />
      ) : (
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

export function DocRelated({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  if (!links.length) return null;
  return (
    <nav className="doc-related" aria-label="Related">
      <p className="doc-related-label">Related</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="doc-related-pill">
              {link.label}
              <ChevronRight className="size-3 opacity-50" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DocTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
}) {
  return (
    <div className="doc-table-wrap">
      <table className="doc-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocCardGrid({
  items,
}: {
  items: { href: string; title: string; description: string; meta?: string }[];
}) {
  return (
    <div className="doc-card-grid">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="doc-card">
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          {item.meta && (
            <p className="mt-3 text-xs text-muted-foreground/80">{item.meta}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

export function DocSection({
  id,
  title,
  children,
  className,
}: {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("doc-section", className)}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
