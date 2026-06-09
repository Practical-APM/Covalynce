import { Injectable } from '@nestjs/common';
import { ProviderName } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CostEngine {
  constructor(private readonly prisma: PrismaService) {}

  async calculateCost(
    provider: ProviderName,
    model: string,
    inputTokens: number,
    outputTokens: number,
    at: Date,
  ): Promise<Prisma.Decimal> {
    const pricing = await this.prisma.pricingVersion.findFirst({
      where: {
        provider,
        model,
        effectiveDate: { lte: at },
      },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!pricing) {
      const fallback = this.estimateFallback(model, inputTokens, outputTokens);
      return new Prisma.Decimal(fallback.toFixed(6));
    }

    const inputCost =
      (inputTokens / 1_000_000) * Number(pricing.inputCostPerMillion);
    const outputCost =
      (outputTokens / 1_000_000) * Number(pricing.outputCostPerMillion);

    return new Prisma.Decimal((inputCost + outputCost).toFixed(6));
  }

  /** Rough fallback when pricing row missing */
  private estimateFallback(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const isPremium =
      model.includes('gpt-4') ||
      model.includes('sonnet') ||
      model.includes('opus');
    const inputRate = isPremium ? 2.5 : 0.15;
    const outputRate = isPremium ? 10 : 0.6;
    return (
      (inputTokens / 1_000_000) * inputRate +
      (outputTokens / 1_000_000) * outputRate
    );
  }
}
