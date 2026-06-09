-- CreateEnum
CREATE TYPE "ProviderAuthType" AS ENUM ('API_KEY', 'OAUTH');

-- CreateEnum
CREATE TYPE "SsoProvider" AS ENUM ('NONE', 'CLERK', 'AUTH0');

-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "auth_type" "ProviderAuthType" NOT NULL DEFAULT 'API_KEY';

-- AlterTable
ALTER TABLE "usage_events" ADD COLUMN     "agent_id" TEXT;

-- CreateTable
CREATE TABLE "gateway_routing_settings" (
    "organization_id" TEXT NOT NULL,
    "intelligent_routing" BOOLEAN NOT NULL DEFAULT false,
    "custom_mappings" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gateway_routing_settings_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "team_id" TEXT,
    "monthly_budget" DECIMAL(12,2),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_licenses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "seats" INTEGER,
    "monthly_cost" DECIMAL(12,2),
    "renews_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_sso_configs" (
    "organization_id" TEXT NOT NULL,
    "provider" "SsoProvider" NOT NULL DEFAULT 'NONE',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "issuer_url" TEXT,
    "jwks_uri" TEXT,
    "audience" TEXT,
    "allowed_email_domains" JSONB NOT NULL DEFAULT '[]',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_sso_configs_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "role_permission_overrides" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permission" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agents_organization_id_idx" ON "agents"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_organization_id_slug_key" ON "agents"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "ai_licenses_organization_id_idx" ON "ai_licenses"("organization_id");

-- CreateIndex
CREATE INDEX "role_permission_overrides_organization_id_role_idx" ON "role_permission_overrides"("organization_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_overrides_organization_id_role_permission_key" ON "role_permission_overrides"("organization_id", "role", "permission");

-- CreateIndex
CREATE INDEX "usage_events_organization_id_agent_id_timestamp_idx" ON "usage_events"("organization_id", "agent_id", "timestamp");

-- AddForeignKey
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gateway_routing_settings" ADD CONSTRAINT "gateway_routing_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_licenses" ADD CONSTRAINT "ai_licenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_sso_configs" ADD CONSTRAINT "organization_sso_configs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission_overrides" ADD CONSTRAINT "role_permission_overrides_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
