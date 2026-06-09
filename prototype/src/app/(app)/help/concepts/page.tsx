import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { DocGraphic } from "@/components/docs/doc-screenshot";
import { ConceptsHubDiagram } from "@/components/docs/doc-illustrations";
import { glossaryTerms } from "@/lib/help-content";

export default function ConceptsPage() {
  return (
    <DocsShell
      title="Concepts & glossary"
      description="Plain-language definitions for every term you will see in Covalynce—with links to deeper guides."
      readTime="4 min"
    >
      <p>
        Bookmark this page when a metric label or sidebar item is unclear. Each term links to the
        feature guide where relevant.
      </p>

      <DocGraphic title="Terms at a glance">
        <ConceptsHubDiagram />
      </DocGraphic>

      <dl className="mt-8 space-y-0 divide-y divide-border/60">
        {glossaryTerms.map((item) => (
          <div key={item.id} id={item.id} className="scroll-mt-24 py-6 first:pt-0">
            <dt className="text-base font-semibold text-foreground">{item.term}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.definition}
              {item.related && (
                <Link
                  href={item.related}
                  className="mt-2 block text-sm font-medium text-foreground hover:underline"
                >
                  Read guide →
                </Link>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </DocsShell>
  );
}
