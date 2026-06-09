import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { Callout } from "@/components/callout";
import { DocScreenshot } from "@/components/docs/doc-screenshot";
import { ProvidersIllustration } from "@/components/docs/doc-illustrations";
import { DocInAppLink, DocSection, DocSteps, DocTable } from "@/components/docs-parts";

export default function FeatureProvidersDoc() {
  return (
    <DocsShell
      title="Providers"
      description="Connect AI vendors so Covalynce can import usage and cost on a schedule."
      readTime="4 min"
    >
      <Callout variant="tip" title="OAuth first">
        Use <strong>Connect with OAuth</strong> when available—revocable delegated access without
        pasting long-lived API keys into the UI.
      </Callout>

      <DocScreenshot
        alt="Providers page with connected OpenAI, Anthropic, and Gemini integrations"
        caption="Each provider card shows connection status and last sync."
      >
        <ProvidersIllustration />
      </DocScreenshot>

      <DocSection title="Connect in four steps">
        <DocSteps
          steps={[
            {
              title: "Open Providers",
              body: <Link href="/providers">Providers</Link>,
            },
            {
              title: "Choose a vendor",
              body: "OpenAI, Anthropic, or Google Gemini for billing sync today.",
            },
            {
              title: "Authorize",
              body: "Complete OAuth in the vendor console, or paste an admin API key if OAuth is not an option.",
            },
            {
              title: "Confirm sync",
              body: "Return to Overview within ~15 minutes to see month-to-date spend populate.",
            },
          ]}
        />
      </DocSection>

      <DocSection title="Supported today">
        <DocTable
          headers={["Provider", "Connection", "Notes"]}
          rows={[
            ["OpenAI", "OAuth or Admin API key", "Needs usage/billing read scope"],
            ["Anthropic", "OAuth or Admin API key", "Admin key format sk-ant-admin…"],
            ["Google Gemini", "Google Cloud OAuth", "Billing export from your GCP project"],
          ]}
        />
      </DocSection>

      <DocSection title="Azure & Bedrock">
        <p>
          Billing adapters for Azure OpenAI and AWS Bedrock are on the roadmap. Route traffic
          through the <Link href="/help/features/gateway">Gateway</Link> with attribution headers
          for per-project spend today.
        </p>
      </DocSection>

      <DocSection title="Gateway keys vs provider connect">
        <p>
          <strong>Provider connect</strong> pulls invoices and usage from vendors.
          <strong> Gateway keys</strong> (<code>gk_…</code>) are issued by Covalynce—your apps use
          them to proxy LLM traffic for logging and policy.
        </p>
      </DocSection>

      <DocInAppLink href="/providers">Manage providers</DocInAppLink>
    </DocsShell>
  );
}
