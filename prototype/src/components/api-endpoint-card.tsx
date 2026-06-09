import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { type ApiEndpoint, methodColor } from "@/lib/api-docs";

export function ApiEndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  return (
    <section
      id={endpoint.path.replace(/[^a-z0-9]+/gi, "-")}
      className="scroll-mt-24 border-b border-border/60 py-8 last:border-0"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${methodColor(endpoint.method)}`}
        >
          {endpoint.method}
        </span>
        <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
        {endpoint.auth && (
          <Badge variant="outline" className="text-[10px]">
            JWT required
          </Badge>
        )}
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight">
        {endpoint.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {endpoint.description}
      </p>
      {endpoint.params && endpoint.params.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg border border-border/80">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-left">
                <th className="px-3 py-2 font-medium">Parameter</th>
                <th className="px-3 py-2 font-medium">In</th>
                <th className="px-3 py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.params.map((p) => (
                <tr key={p.name} className="border-b border-border/40 last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">{p.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.in}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {endpoint.exampleRequest && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Example
          </p>
          <CodeBlock
            code={endpoint.exampleRequest}
            language="curl"
            title="Request"
          />
        </div>
      )}
      {endpoint.exampleResponse && (
        <div className="mt-3">
          <CodeBlock
            code={endpoint.exampleResponse}
            language="json"
            title="Response"
          />
        </div>
      )}
    </section>
  );
}
