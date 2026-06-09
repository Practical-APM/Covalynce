import { ProviderName, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const pricing = [
  { provider: ProviderName.OPENAI, model: 'gpt-4o', input: 2.5, output: 10 },
  { provider: ProviderName.OPENAI, model: 'gpt-4o-mini', input: 0.15, output: 0.6 },
  { provider: ProviderName.OPENAI, model: 'o3-mini', input: 1.1, output: 4.4 },
  { provider: ProviderName.ANTHROPIC, model: 'claude-sonnet-4', input: 3, output: 15 },
  { provider: ProviderName.ANTHROPIC, model: 'claude-haiku', input: 0.25, output: 1.25 },
  { provider: ProviderName.GEMINI, model: 'gemini-2.0-flash', input: 0.1, output: 0.4 },
  { provider: ProviderName.GEMINI, model: 'gemini-2.0-pro', input: 1.25, output: 5 },
];

async function main() {
  const effectiveDate = new Date('2026-01-01T00:00:00Z');

  for (const row of pricing) {
    await prisma.pricingVersion.upsert({
      where: {
        provider_model_effectiveDate: {
          provider: row.provider,
          model: row.model,
          effectiveDate,
        },
      },
      create: {
        provider: row.provider,
        model: row.model,
        effectiveDate,
        inputCostPerMillion: new Decimal(row.input),
        outputCostPerMillion: new Decimal(row.output),
      },
      update: {
        inputCostPerMillion: new Decimal(row.input),
        outputCostPerMillion: new Decimal(row.output),
      },
    });
  }

  console.log(`Seeded ${pricing.length} pricing versions`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
