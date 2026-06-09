import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";
import { DocGraphic } from "@/components/docs/doc-screenshot";
import { GettingStartedIllustration } from "@/components/docs/doc-illustrations";
import { DocInAppLink, DocSection, DocSteps } from "@/components/docs-parts";

const steps = [
  {
    title: "Create your organization",
    time: "1 min",
    body: (
      <>
        Use <Link href="/onboarding">onboarding</Link> or sign up with your company name and
        admin email. You get a workspace immediately—solo exploration is supported on Community
        Edition.
      </>
    ),
  },
  {
    title: "Connect a provider or load sample data",
    time: "2 min",
    body: (
      <>
        Open <Link href="/providers">Providers</Link> and connect OpenAI, Anthropic, or Gemini
        with OAuth (recommended). For a quick tour without credentials, use demo mode or sample
        data from onboarding.
      </>
    ),
  },
  {
    title: "Wait for the first sync",
    time: "≤15 min",
    body: "Billing sync runs on a schedule. Overview populates after the first successful pull. Sync status appears on the dashboard if something is overdue.",
  },
  {
    title: "Set a budget and alerts",
    time: "2 min",
    body: (
      <>
        In <Link href="/budgets">Budgets</Link>, set a monthly cap. Configure Slack or email in{" "}
        <Link href="/alerts/settings">Alert settings</Link> so owners hear about thresholds before
        overrun.
      </>
    ),
  },
  {
    title: "Optional: enable the Gateway",
    time: "5+ min",
    body: (
      <>
        When you need request-time policy—not just invoices—create a gateway key on{" "}
        <Link href="/gateway">Gateway</Link> and point your SDK at our proxy. See the{" "}
        <Link href="/help/features/gateway">Gateway guide</Link>.
      </>
    ),
  },
];

export default function GettingStartedDocPage() {
  return (
    <DocsShell
      title="Getting started"
      description="From zero to a live Overview in about five minutes. No FinOps background required."
      readTime="5 min"
    >
      <Callout variant="tip" title="Who this is for">
        Finance, platform, and team leads who need &ldquo;how much did we spend on AI?&rdquo;
        without reconciling three vendor dashboards.
      </Callout>

      <DocGraphic title="Five-minute path">
        <GettingStartedIllustration />
      </DocGraphic>

      <DocSection id="checklist" title="Setup checklist">
        <DocSteps steps={steps} />
      </DocSection>

      <DocSection id="self-host" title="Self-host Community Edition">
        <p>Run API and database with Docker Compose from the repository root.</p>
        <CodeBlock
          language="bash"
          title="Terminal"
          code={`cd api && npx prisma migrate dev
docker compose -f docker-compose.prod.yml up -d`}
        />
      </DocSection>

      <DocInAppLink href="/dashboard">Open Overview</DocInAppLink>
    </DocsShell>
  );
}
