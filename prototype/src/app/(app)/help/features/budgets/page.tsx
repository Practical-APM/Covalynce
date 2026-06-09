import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { DocScreenshot } from "@/components/docs/doc-screenshot";
import { BudgetsIllustration } from "@/components/docs/doc-illustrations";
import { DocInAppLink, DocSection, DocTable } from "@/components/docs-parts";

export default function FeatureBudgetsDoc() {
  return (
    <DocsShell
      title="Budgets & alerts"
      description="Set spending limits and notify owners before finance gets a surprise invoice."
      readTime="3 min"
    >
      <DocScreenshot
        alt="Budget utilization bar with 80% alert threshold and team breakdown"
        caption="Utilization compares month-to-date spend against your configured cap."
        annotations={[
          { label: "80% alert", x: 78, y: 42 },
          { label: "Team budgets", x: 28, y: 78 },
        ]}
      >
        <BudgetsIllustration />
      </DocScreenshot>

      <DocSection title="Budgets">
        <p>
          A budget is a monthly dollar cap—organization-wide or per team. Overview shows{" "}
          <strong>utilization</strong> as spend ÷ budget. Finance teams often set org cap first,
          then team budgets for chargeback.
        </p>
      </DocSection>

      <DocSection title="Alerts">
        <DocTable
          headers={["Trigger", "What happens"]}
          rows={[
            ["Threshold % (e.g. 80%)", "Notification to configured channels—email or Slack"],
            ["100% utilization", "Critical alert; pair with policies or gateway caps for enforcement"],
            ["Anomaly (Insights)", "Separate from budgets—flags unusual daily spikes"],
          ]}
        />
        <p className="mt-4">
          Configure channels in <Link href="/alerts/settings">Alert settings</Link>. View fired
          alerts on <Link href="/alerts">Alerts</Link>.
        </p>
      </DocSection>

      <DocSection title="Recommended workflow">
        <ol>
          <li>Set org monthly budget after first full month of visibility</li>
          <li>Add 80% and 100% thresholds</li>
          <li>Add team budgets when chargeback model is defined</li>
          <li>Use Gateway hard caps only when you need to block requests, not just notify</li>
        </ol>
      </DocSection>

      <div className="mt-6 flex flex-wrap gap-3">
        <DocInAppLink href="/budgets">Manage budgets</DocInAppLink>
        <DocInAppLink href="/alerts/settings">Alert settings</DocInAppLink>
      </div>
    </DocsShell>
  );
}
