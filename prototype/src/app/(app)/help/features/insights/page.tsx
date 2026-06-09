import { DocsShell } from "@/components/docs-shell";
import { Callout } from "@/components/callout";
import { DocScreenshot } from "@/components/docs/doc-screenshot";
import { InsightsIllustration } from "@/components/docs/doc-illustrations";
import { DocInAppLink, DocSection } from "@/components/docs-parts";

export default function FeatureInsightsDoc() {
  return (
    <DocsShell
      title="Insights"
      description="Automatic recommendations to reduce cost and flags when spend looks unusual."
      readTime="2 min"
    >
      <DocScreenshot
        alt="Insights cards showing cost optimization and anomaly detection"
        caption="Optimization and anomaly cards surface actionable patterns without digging through raw usage."
      >
        <InsightsIllustration />
      </DocScreenshot>

      <DocSection title="Optimization insights">
        <p>
          Suggestions such as moving low-risk workloads to a cheaper model. Admins can apply a deny
          policy from the Insights page when a recommendation should become enforcement.
        </p>
      </DocSection>

      <DocSection title="Anomalies">
        <p>
          Statistical detection when daily or per-user spend jumps compared to recent history—useful
          for catching misconfigured agents or leaked keys before the monthly close.
        </p>
      </DocSection>

      <Callout variant="note" title="Not a substitute for budgets">
        Insights complement budgets and alerts. Set budgets for known limits; use Insights for
        optimization and unexpected patterns.
      </Callout>

      <DocInAppLink href="/insights">Open Insights</DocInAppLink>
    </DocsShell>
  );
}
