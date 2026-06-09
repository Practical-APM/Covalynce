"use client";

import { FileDown, Mail } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpTip } from "@/components/help-tip";
import { useAuth } from "@/components/auth-provider";
import { useEditionFeatures } from "@/components/edition-features-provider";
import { usePermissions } from "@/components/permissions-provider";
import { EnterpriseFeatureGate } from "@/components/enterprise-upsell";
import { useToast } from "@/components/toast-provider";
import { PAGE_META } from "@/lib/page-meta";
import { downloadCsv, downloadText } from "@/lib/download";
import { api } from "@/lib/api";
import Link from "next/link";

const reportTemplates = [
  {
    id: "executive",
    name: "Executive monthly summary",
    description: "Total spend, top teams, top providers, and budget status.",
    format: "CSV",
    filename: "covalynce-executive-summary.csv",
    headers: ["metric", "value"],
    rows: [
      ["period", "month_to_date"],
      [
        "note",
        "Export full data from Overview and Usage while scheduled reports are in development.",
      ],
    ],
  },
  {
    id: "teams",
    name: "Team cost allocation",
    description: "Per-team spend for finance chargeback (open Teams for live export).",
    format: "CSV",
    filename: "covalynce-team-allocation.csv",
    headers: ["team", "note"],
    rows: [["—", "Use Teams page or API /api/v1/analytics for full export"]],
  },
  {
    id: "providers",
    name: "Provider reconciliation",
    description: "Compare Covalynce totals to vendor invoices.",
    format: "CSV",
    filename: "covalynce-provider-reconciliation.csv",
    headers: ["provider", "note"],
    rows: [["—", "Use Providers page after sync completes"]],
  },
  {
    id: "models",
    name: "Model usage report",
    description: "Cost and volume by model for optimization reviews.",
    format: "CSV",
    filename: "covalynce-model-usage.csv",
    headers: ["model", "note"],
    rows: [["—", "Use Models page or analytics API"]],
  },
];

const meta = PAGE_META["/reports"];

export default function ReportsPage() {
  const { apiMode } = useAuth();
  const { hasPermission } = usePermissions();
  const { hasEnterpriseFeature } = useEditionFeatures();
  const { toast, toastError } = useToast();
  const canExportCompliance =
    hasPermission("compliance:export") &&
    hasEnterpriseFeature("compliance_export");
  const canChargeback = hasPermission("cost_centers:read");
  const [chargebackLoading, setChargebackLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  async function handleComplianceExport() {
    try {
      const bundle = await api.exportComplianceBundle(30);
      for (const file of bundle.files) {
        downloadText(file.filename, file.content, "text/csv;charset=utf-8");
      }
      toast(
        `Downloaded ${bundle.files.length} compliance files for ${bundle.organization}.`,
        "success"
      );
    } catch (err) {
      toastError(
        err instanceof Error ? err.message : "Compliance export failed"
      );
    }
  }

  async function handleChargebackDownload() {
    setChargebackLoading(true);
    try {
      const report = await api.chargebackReport(30);
      const headers = ["code", "name", "team", "events", "spend_usd"];
      const rows = [
        ...report.costCenters.map((l) => ({
          code: l.code,
          name: l.name,
          team: l.teamName ?? "",
          events: String(l.eventCount),
          spend_usd: l.spend.toFixed(2),
        })),
        {
          code: "UNTAGGED",
          name: "Untagged gateway usage",
          team: "",
          events: String(report.untagged.eventCount),
          spend_usd: report.untagged.spend.toFixed(2),
        },
      ];
      downloadCsv("covalynce-chargeback-30d.csv", headers, rows);
      toast("Chargeback report downloaded.", "success");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Chargeback export failed");
    } finally {
      setChargebackLoading(false);
    }
  }

  async function handleChargebackEmail() {
    setEmailLoading(true);
    try {
      const res = await api.emailChargebackReport(30);
      if (res.demo && res.csv) {
        downloadText(
          "covalynce-chargeback-30d.csv",
          res.csv,
          "text/csv;charset=utf-8"
        );
      }
      toast(res.message, res.sent ? "success" : "info");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Email delivery failed");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={meta.title}
        description={meta.description}
        docHref="/help/getting-started"
      >
        <span className="inline-flex items-center gap-1.5">
          <Button
            variant="outline"
            disabled={!apiMode || !canChargeback || emailLoading}
            className="gap-2"
            onClick={handleChargebackEmail}
          >
            <Mail className="size-4" />
            {emailLoading ? "Sending…" : "Email chargeback report"}
          </Button>
          <HelpTip content="Sends a 30-day chargeback CSV to your login email when Resend is configured. Otherwise downloads CSV in dev mode." />
        </span>
      </PageHeader>

      <Callout variant="note" title="Exports today" className="mt-6">
        {apiMode && canExportCompliance ? (
          <>
            Download the full compliance bundle (audit log, usage, policies) or
            use starter templates below. For line-item usage, export from the{" "}
            <Link href="/usage" className="font-medium text-primary hover:underline">
              Usage
            </Link>{" "}
            page.
          </>
        ) : (
          <>
            Generate downloads a small CSV template with guidance. For full
            exports, enable API mode and use Compliance export or the Usage
            table.
          </>
        )}
      </Callout>

      {apiMode && canChargeback && (
        <div className="mt-6">
          <div className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Cost center chargeback</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Spend by allocation code from gateway{" "}
                <code className="text-xs">X-Covalynce-Project-Tag</code> headers
                (last 30 days). Manage codes in{" "}
                <Link href="/settings/cost-centers" className="text-primary hover:underline">
                  Settings → Cost centers
                </Link>
                .
              </p>
            </div>
            <Button
              className="gap-2"
              variant="outline"
              disabled={chargebackLoading}
              onClick={handleChargebackDownload}
            >
              <FileDown className="size-4" />
              {chargebackLoading ? "Exporting…" : "Download chargeback CSV"}
            </Button>
          </div>
        </div>
      )}

      {apiMode && canExportCompliance && (
        <div className="mt-6">
          <div className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Compliance bundle</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Audit log, usage summary, and policy rules for the last 30 days.
              </p>
              {hasPermission("compliance:export") &&
                !hasEnterpriseFeature("compliance_export") && (
                  <EnterpriseFeatureGate
                    feature="compliance_export"
                    className="mt-2"
                  />
                )}
            </div>
            <Button
              className="gap-2"
              disabled={!canExportCompliance}
              onClick={handleComplianceExport}
            >
              <FileDown className="size-4" />
              Export compliance bundle
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {reportTemplates.map((report) => (
          <div key={report.id} className="surface-panel flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{report.name}</h3>
              <Badge variant="secondary">{report.format}</Badge>
            </div>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {report.description}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-fit gap-2"
              onClick={() =>
                downloadCsv(
                  report.filename,
                  report.headers,
                  report.rows.map((r) =>
                    Object.fromEntries(
                      report.headers.map((h, i) => [h, String(r[i] ?? "")])
                    )
                  )
                )
              }
            >
              <FileDown className="size-4" />
              Download template
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
