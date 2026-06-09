-- CreateEnum
CREATE TYPE "PolicyRuleType" AS ENUM ('MODEL_ALLOW_LIST', 'MODEL_DENY_LIST', 'BUDGET_HARD_CAP');

-- CreateEnum
CREATE TYPE "PolicyScope" AS ENUM ('ORGANIZATION', 'TEAM');

-- CreateEnum
CREATE TYPE "BudgetEnforcement" AS ENUM ('MONITORING', 'HARD_CAP');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "budget_enforcement" "BudgetEnforcement" NOT NULL DEFAULT 'MONITORING';

-- CreateTable
CREATE TABLE "daily_spend_snapshots" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "total_cost" DECIMAL(14,6) NOT NULL,
    "request_count" INTEGER NOT NULL,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_spend_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gateway_api_keys" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "rate_limit_rpm" INTEGER NOT NULL DEFAULT 120,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gateway_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "team_id" TEXT,
    "name" TEXT NOT NULL,
    "type" "PolicyRuleType" NOT NULL,
    "scope" "PolicyScope" NOT NULL DEFAULT 'ORGANIZATION',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_spend_snapshots_organization_id_snapshot_date_idx" ON "daily_spend_snapshots"("organization_id", "snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_spend_snapshots_organization_id_snapshot_date_key" ON "daily_spend_snapshots"("organization_id", "snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "gateway_api_keys_key_hash_key" ON "gateway_api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "gateway_api_keys_organization_id_idx" ON "gateway_api_keys"("organization_id");

-- CreateIndex
CREATE INDEX "policy_rules_organization_id_enabled_idx" ON "policy_rules"("organization_id", "enabled");

-- AddForeignKey
ALTER TABLE "daily_spend_snapshots" ADD CONSTRAINT "daily_spend_snapshots_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gateway_api_keys" ADD CONSTRAINT "gateway_api_keys_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_rules" ADD CONSTRAINT "policy_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_rules" ADD CONSTRAINT "policy_rules_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
