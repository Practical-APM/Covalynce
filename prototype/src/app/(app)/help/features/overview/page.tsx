import { DocsShell } from "@/components/docs-shell";
import { Callout } from "@/components/callout";
import { DocScreenshot } from "@/components/docs/doc-screenshot";
import { OverviewDashboardIllustration } from "@/components/docs/doc-illustrations";
import { DocInAppLink, DocSection, DocTable } from "@/components/docs-parts";

export default function FeatureOverviewDoc() {
  return (
    <DocsShell
      title="Overview dashboard"
      description="Your single view of organization-wide AI spend, budget health, and where cost concentrates."
      readTime="3 min"
    >
      <Callout variant="note" title="Before numbers appear">
        Connect at least one provider on the Providers page. Until the first sync completes,
        Overview may show empty states or sample data if you enabled demo mode.
      </Callout>

      <DocScreenshot
        alt="Overview dashboard showing spend metrics, budget utilization, and charts"
        caption="Overview rolls up spend, budget health, and top drivers in one place."
        annotations={[
          { label: "Date range", x: 88, y: 12 },
          { label: "Budget util.", x: 55, y: 28 },
          { label: "Spend trend", x: 50, y: 58 },
        ]}
      >
        <OverviewDashboardIllustration />
      </DocScreenshot>

      <DocSection title="What you see">
        <DocTable
          headers={["Metric / chart", "Meaning"]}
          rows={[
            ["Total spend", "Sum across all connected providers for the selected date range."],
            [
              "Budget utilization",
              "Spend divided by your active monthly budget, shown as a percentage. Hover (?) on the app for the exact formula.",
            ],
            ["Spend over time", "Daily trend—useful for spotting ramps before the invoice."],
            ["Top models", "Which models drive the most cost in the period."],
            ["Top teams", "Which teams drive the most cost—requires attribution via gateway headers or team mapping."],
            ["Sync health", "Whether provider billing sync is current or needs attention."],
          ]}
        />
      </DocSection>

      <DocSection title="Date range">
        <p>
          The selector in the top right (month-to-date, last 7 days, custom) updates every chart
          on the page at once. Use the same range when comparing to finance reports.
        </p>
      </DocSection>

      <DocSection title="What to do next">
        <ul>
          <li>Connect providers if totals are empty</li>
          <li>Set a budget so utilization has meaning</li>
          <li>Drill into Usage for line-item detail</li>
        </ul>
      </DocSection>

      <DocInAppLink href="/dashboard">Open Overview</DocInAppLink>
    </DocsShell>
  );
}
