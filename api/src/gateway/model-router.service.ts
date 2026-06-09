import { ForbiddenException, Injectable } from '@nestjs/common';
import { ProviderName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CHEAPER_ALTERNATIVES,
  inferProviderFromModel,
  type RouteResolution,
} from './model-routing.constants';

type CustomMappings = Record<string, { provider: ProviderName; model: string }>;

@Injectable()
export class ModelRouterService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(
    organizationId: string,
    requestedModel: string,
  ): Promise<RouteResolution> {
    const settings = await this.prisma.gatewayRoutingSettings.findUnique({
      where: { organizationId },
    });

    const custom = (settings?.customMappings ?? {}) as CustomMappings;
    let provider: ProviderName;
    let model = requestedModel;

    if (custom[requestedModel]) {
      provider = custom[requestedModel].provider;
      model = custom[requestedModel].model;
    } else {
      provider = inferProviderFromModel(requestedModel);
    }

    let routed = model !== requestedModel;
    const intelligentRouting = settings?.intelligentRouting ?? false;

    if (intelligentRouting && model === requestedModel) {
      const alt = CHEAPER_ALTERNATIVES[requestedModel];
      if (alt) {
        model = alt.model;
        provider = alt.provider;
        routed = true;
      }
    }

    return {
      provider,
      model,
      requestedModel,
      intelligentRouting,
      routed,
    };
  }

  async getSettings(organizationId: string) {
    const settings = await this.prisma.gatewayRoutingSettings.findUnique({
      where: { organizationId },
    });
    return {
      intelligentRouting: settings?.intelligentRouting ?? false,
      customMappings: (settings?.customMappings ?? {}) as CustomMappings,
    };
  }

  async updateSettings(
    organizationId: string,
    payload: {
      intelligentRouting?: boolean;
      customMappings?: CustomMappings;
    },
  ) {
    const settings = await this.prisma.gatewayRoutingSettings.upsert({
      where: { organizationId },
      create: {
        organizationId,
        intelligentRouting: payload.intelligentRouting ?? false,
        customMappings: payload.customMappings ?? {},
      },
      update: {
        ...(payload.intelligentRouting !== undefined
          ? { intelligentRouting: payload.intelligentRouting }
          : {}),
        ...(payload.customMappings !== undefined
          ? { customMappings: payload.customMappings }
          : {}),
      },
    });

    return {
      intelligentRouting: settings.intelligentRouting,
      customMappings: settings.customMappings as CustomMappings,
    };
  }

  async checkAgentBudget(agentId: string, organizationId: string) {
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentId, organizationId, enabled: true },
    });
    if (!agent?.monthlyBudget) return;

    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);

    const agg = await this.prisma.usageEvent.aggregate({
      where: {
        organizationId,
        agentId,
        timestamp: { gte: start },
      },
      _sum: { cost: true },
    });

    const spent = Number(agg._sum.cost ?? 0);
    const limit = Number(agent.monthlyBudget);
    if (limit > 0 && spent >= limit) {
      throw new ForbiddenException({
        error: {
          message: `Agent "${agent.name}" monthly budget exceeded ($${spent.toFixed(2)} / $${limit.toFixed(2)})`,
          type: 'agent_budget_exceeded',
          code: 'agent_budget_blocked',
        },
      });
    }
  }
}
