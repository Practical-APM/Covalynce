-- Cost centers for chargeback / FinOps allocation
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "team_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cost_centers_organization_id_code_key" ON "cost_centers"("organization_id", "code");
CREATE INDEX "cost_centers_organization_id_idx" ON "cost_centers"("organization_id");

ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Project tags on gateway-recorded usage
ALTER TABLE "usage_events" ADD COLUMN "project_tag" TEXT;
CREATE INDEX "usage_events_organization_id_project_tag_timestamp_idx" ON "usage_events"("organization_id", "project_tag", "timestamp");
