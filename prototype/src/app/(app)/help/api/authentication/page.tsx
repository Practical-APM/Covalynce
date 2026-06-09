import { DocsShell } from "@/components/docs-shell";
import { ApiEndpointCard } from "@/components/api-endpoint-card";
import { Callout } from "@/components/callout";
import { API_SECTIONS } from "@/lib/api-docs";

const section = API_SECTIONS.find((s) => s.id === "auth")!;

export default function ApiAuthPage() {
  return (
    <DocsShell
      title="Authentication"
      description="How to obtain and use JWT tokens for the Covalynce REST API."
      readTime="4 min"
    >
      <Callout variant="tip" title="For most users">
        You do not need the API if you only use the web app. Sign in at /login;
        the app stores your session automatically.
      </Callout>

      <h2>JWT bearer token</h2>
      <p>
        After login or SSO exchange, send the access token on every request:
      </p>
      <p>
        <code>Authorization: Bearer eyJ...</code>
      </p>

      {section.endpoints.map((endpoint) => (
        <ApiEndpointCard key={endpoint.path} endpoint={endpoint} />
      ))}
    </DocsShell>
  );
}
