import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";
import { DocGraphic } from "@/components/docs/doc-screenshot";
import { AttributionDiagram } from "@/components/docs/doc-illustrations";
import { DocSection, DocTable } from "@/components/docs-parts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function GatewayAttributionDoc() {
  return (
    <DocsShell
      title="Gateway attribution headers"
      description="Tag gateway requests so usage rolls up by agent, user, team, and cost center."
      readTime="5 min"
    >
      <Callout variant="tip" title="Why headers matter">
        Provider billing gives vendor totals. Headers attribute each gateway request so Overview,
        Teams, and Users reports reflect who drove the cost.
      </Callout>

      <DocGraphic title="How attribution flows">
        <AttributionDiagram />
      </DocGraphic>

      <DocSection title="Request headers">
        <DocTable
          headers={["Header", "Value", "Effect"]}
          rows={[
            [
              "X-Covalynce-Agent-Id",
              "Agent slug from Agents page",
              "Attributes spend to agent; enforces agent budget if set",
            ],
            [
              "X-Covalynce-User-Id",
              "Your user ID or email",
              "Rolls up on Users reports",
            ],
            [
              "X-Covalynce-Team-Id",
              "Team slug or ID",
              "Rolls up on Teams reports",
            ],
            [
              "X-Covalynce-Project-Tag",
              "Cost center code",
              "Chargeback / project allocation",
            ],
            [
              "X-Covalynce-Key",
              "Gateway key",
              "Alternative to Authorization: Bearer gk_…",
            ],
          ]}
        />
      </DocSection>

      <DocSection title="Response">
        <p>
          Successful responses may include <code>X-Covalynce-Routing</code>—JSON describing which
          provider and model handled the request.
        </p>
      </DocSection>

      <DocSection title="Example">
        <CodeBlock
          language="python"
          title="OpenAI SDK with headers"
          code={`from openai import OpenAI

client = OpenAI(
  api_key="gk_your_key",
  base_url="${API_BASE}/api/v1/gateway/v1/route",
  default_headers={
    "X-Covalynce-Agent-Id": "support-bot",
    "X-Covalynce-User-Id": "jane@company.com",
    "X-Covalynce-Team-Id": "platform",
  },
)`}
        />
      </DocSection>

      <Callout variant="note" title="Register agents first">
        <code>X-Covalynce-Agent-Id</code> must match a slug in{" "}
        <Link href="/agents">Agents</Link>. Unknown slugs are ignored—the request succeeds but
        spend is not attributed to an agent.
      </Callout>
    </DocsShell>
  );
}
