import { ProviderName } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CostEngine } from '../cost/cost-engine';

describe('CostEngine', () => {
  const mockPrisma = {
    pricingVersion: {
      findFirst: jest.fn(),
    },
  };

  let engine: CostEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new CostEngine(mockPrisma as never);
  });

  it('calculates cost from pricing table', async () => {
    mockPrisma.pricingVersion.findFirst.mockResolvedValue({
      inputCostPerMillion: new Decimal(2.5),
      outputCostPerMillion: new Decimal(10),
    });

    const cost = await engine.calculateCost(
      ProviderName.OPENAI,
      'gpt-4o',
      1_000_000,
      500_000,
      new Date(),
    );

    expect(Number(cost)).toBeCloseTo(7.5, 2);
  });

  it('uses fallback when pricing missing', async () => {
    mockPrisma.pricingVersion.findFirst.mockResolvedValue(null);

    const cost = await engine.calculateCost(
      ProviderName.OPENAI,
      'unknown-model',
      1_000_000,
      0,
      new Date(),
    );

    expect(Number(cost)).toBeGreaterThan(0);
  });
});
