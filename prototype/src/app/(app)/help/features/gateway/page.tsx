import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";
import { DocScreenshot } from "@/components/docs/doc-screenshot";
import { GatewayIllustration } from "@/components/docs/doc-illustrations";
import { DocInAppLink, DocSection, DocSteps } from "@/components/docs-parts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function FeatureGatewayDoc() {
  return (
    <DocsShell
      title="AI Gateway"
      description="Route LLM traffic through Covalynce for logging, attribution, and real-time policy."
      readTime="6 min"
    >
      <Callout variant="note" title="Billing sync vs Gateway">
        <strong>Providers alone</strong> answer &ldquo;what did we spend?&rdquo; after sync.
        <strong> Gateway</strong> answers &ldquo;should this request run?&rdquo; and attributes
        spend per team, user, or agent on every call.
      </Callout>

      <DocScreenshot
        alt="Request flow from your application through Covalynce Gateway to LLM providers"
        caption="Apps send OpenAI-compatible requests to the gateway; Covalynce logs, routes, and enforces policy."
      >
        <GatewayIllustration />
      </DocScreenshot>

      <DocSection title="When to add Gateway">
        <ul>
          <li>You need to block or cap models at request time</li>
          <li>Azure or Bedrock spend must split by project or tenant</li>
          <li>Engineering wants one key rotation point instead of vendor keys in every service</li>
        </ul>
      </DocSection>

      <DocSection title="Setup">
        <DocSteps
          steps={[
            {
              title: "Create a gateway key",
              body: (
                <>
                  On <Link href="/gateway">Gateway</Link>, issue a key prefixed with{" "}
                  <code>gk_</code>.
                </>
              ),
            },
            {
              title: "Point your SDK",
              body: "Set base URL to Covalynce gateway route (OpenAI-compatible).",
            },
            {
              title: "Add attribution headers",
              body: (
                <>
                  Optional but recommended—see{" "}
                  <Link href="/help/features/gateway-attribution">Attribution headers</Link>.
                </>
              ),
            },
            {
              title: "Verify in Usage",
              body: "Requests appear in Usage within seconds with model and token counts.",
            },
          ]}
        />
      </DocSection>

      <DocSection title="Example (OpenAI SDK)">
        <CodeBlock
          language="python"
          title="Python"
          code={`from openai import OpenAI

client = OpenAI(
  api_key="gk_your_key",
  base_url="${API_BASE}/api/v1/gateway/v1",
)

client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[{"role": "user", "content": "Hello"}],
)`}
        />
      </DocSection>

      <DocInAppLink href="/gateway">Manage gateway keys</DocInAppLink>
    </DocsShell>
  );
}
