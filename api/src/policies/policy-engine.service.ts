import { Injectable } from '@nestjs/common';
import {
  BudgetEnforcement,
  BudgetScope,
  PolicyRuleType,
  ProviderName,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetsService } from '../budgets/budgets.service';

export type GatewayPolicyContext = {
  organizationId: string;
  teamId?: string;
  userId?: string;
  provider: ProviderName;
  model: string;
};

@Injectable()
export class PolicyEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly budgets: BudgetsService,
  ) {}

  async evaluate(
    ctx: GatewayPolicyContext,
  ): Promise<{ allowed: boolean; reason?: string; ruleId?: string }> {
    const org = await this.prisma.organization.findUnique({
      where: { id: ctx.organizationId },
      select: { budgetEnforcement: true },
    });

    const rules = await this.prisma.policyRule.findMany({
      where: {
        organizationId: ctx.organizationId,
        enabled: true,
        OR: [
          { scope: 'ORGANIZATION', teamId: null },
          ...(ctx.teamId ? [{ teamId: ctx.teamId }] : []),
        ],
      },
    });

    for (const rule of rules) {
      const config = rule.config as Record<string, unknown>;

      if (rule.type === PolicyRuleType.MODEL_DENY_LIST) {
        const models = (config.models as string[]) ?? [];
        if (models.includes(ctx.model)) {
          return {
            allowed: false,
            reason: `Model "${ctx.model}" is denied by policy "${rule.name}"`,
            ruleId: rule.id,
          };
        }
      }

      if (rule.type === PolicyRuleType.MODEL_ALLOW_LIST) {
        const models = (config.models as string[]) ?? [];
        if (models.length > 0 && !models.includes(ctx.model)) {
          return {
            allowed: false,
            reason: `Model "${ctx.model}" is not on the allow list (${rule.name})`,
            ruleId: rule.id,
          };
        }
      }
    }

    const hardCapRule = rules.some(
      (r) => r.type === PolicyRuleType.BUDGET_HARD_CAP && r.enabled,
    );
    const enforceHardCap =
      org?.budgetEnforcement === BudgetEnforcement.HARD_CAP || hardCapRule;

    if (enforceHardCap) {
      const blocked = await this.isOverBudget(ctx.organizationId, ctx.teamId);
      if (blocked) {
        return {
          allowed: false,
          reason: 'Monthly budget hard cap reached — request blocked by policy',
        };
      }
    }

    return { allowed: true };
  }

  private async isOverBudget(organizationId: string, teamId?: string) {
    const budgets = await this.budgets.listWithSpend(organizationId);

    if (teamId) {
      const teamBudgets = budgets.filter(
        (b) => b.scope === BudgetScope.TEAM && b.teamId === teamId,
      );
      if (teamBudgets.some((b) => b.utilization >= 100)) return true;
    }

    const orgBudgets = budgets.filter(
      (b) => b.scope === BudgetScope.ORGANIZATION,
    );
    if (orgBudgets.length === 0) return false;

    return orgBudgets.some((b) => b.utilization >= 100);
  }
}
