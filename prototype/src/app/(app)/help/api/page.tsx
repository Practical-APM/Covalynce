import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { ApiEndpointCard } from "@/components/api-endpoint-card";
import { Callout } from "@/components/callout";
import { DocSection } from "@/components/docs-parts";
import { API_SECTIONS } from "@/lib/api-docs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function ApiReferencePage() {
  return (
    <DocsShell
      title="API reference"
      description="REST documentation with copy-paste examples. OpenAPI remains on the API server for codegen."
      readTime="10+ min"
    >
      <Callout variant="note" title="Base URL">
        Paths are relative to <code>{API_BASE}</code>. Authenticated routes need{" "}
        <code>Authorization: Bearer &lt;JWT&gt;</code>.
      </Callout>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { href: "/help/api/authentication", label: "Authentication" },
          { href: "/help/api/gateway", label: "Gateway" },
          { href: `${API_BASE}/docs`, label: "OpenAPI (Swagger) ↗", external: true },
        ].map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border/80 px-3 py-1.5 text-sm transition-colors hover:bg-muted/50"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-border/80 px-3 py-1.5 text-sm transition-colors hover:bg-muted/50"
            >
              {link.label}
            </Link>
          )
        )}
      </div>

      {API_SECTIONS.map((section) => (
        <DocSection key={section.id} id={section.id} title={section.title}>
          <p>{section.description}</p>
          {section.endpoints.map((endpoint) => (
            <ApiEndpointCard key={endpoint.path + endpoint.method} endpoint={endpoint} />
          ))}
        </DocSection>
      ))}
    </DocsShell>
  );
}
