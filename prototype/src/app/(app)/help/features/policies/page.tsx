import Link from "next/link";
import { DocsShell } from "@/components/docs-shell";
import { Callout } from "@/components/callout";
import { DocScreenshot } from "@/components/docs/doc-screenshot";
import { PoliciesIllustration } from "@/components/docs/doc-illustrations";
import { DocInAppLink, DocSection, DocTable } from "@/components/docs-parts";

export default function FeaturePoliciesDoc() {
  return (
    <DocsShell
      title="Policies"
      description="Rules that control which models and teams can spend—and when to hard-stop usage."
      readTime="3 min"
    >
      <Callout variant="note" title="Requires Gateway">
        Policies evaluate on gateway traffic. Billing-only visibility does not enforce policies
        retroactively on vendor-direct calls.
      </Callout>

      <DocScreenshot
        alt="Policies table with Allow, Deny, and Hard cap rules"
        caption="Policies evaluate on every gateway request — billing-only visibility cannot enforce them retroactively."
      >
        <PoliciesIllustration />
      </DocScreenshot>

      <DocSection title="Policy actions">
        <DocTable
          headers={["Action", "Behavior"]}
          rows={[
            ["Allow", "Explicitly permit a model, team, or agent"],
            ["Deny", "Block matching requests—the gateway returns an error"],
            ["Hard cap", "Stop spend when a configured limit is reached"],
          ]}
        />
      </DocSection>

      <DocSection title="Policy as code">
        <p>
          Export policies from the Policies page, edit YAML in Git, and import back. Security teams
          can review changes in pull requests like any other infrastructure config.
        </p>
      </DocSection>

      <DocSection title="Common patterns">
        <ul>
          <li>Deny high-cost models for intern or sandbox teams</li>
          <li>Hard-cap org spend during pilot phases</li>
          <li>Allow only approved models in production agents</li>
        </ul>
      </DocSection>

      <DocInAppLink href="/policies">Manage policies</DocInAppLink>
    </DocsShell>
  );
}
