import { DocsShell } from "@/components/docs-shell";
import { ApiEndpointCard } from "@/components/api-endpoint-card";
import { Callout } from "@/components/callout";
import { API_SECTIONS } from "@/lib/api-docs";

const section = API_SECTIONS.find((s) => s.id === "gateway")!;

export default function ApiGatewayPage() {
  return (
    <DocsShell
      title="Gateway API"
      description="OpenAI-compatible endpoints that record usage and enforce policies."
      readTime="5 min"
    >
      <Callout variant="warning" title="Gateway keys are not JWTs">
        Use a gateway key (<code>gk_...</code>) in the Authorization header for
        completion routes, not your user JWT.
      </Callout>

      {section.endpoints.map((endpoint) => (
        <ApiEndpointCard key={endpoint.path} endpoint={endpoint} />
      ))}
    </DocsShell>
  );
}
