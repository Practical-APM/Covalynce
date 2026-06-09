import { ProviderName } from '@prisma/client';

export const CHEAPER_ALTERNATIVES: Record<
  string,
  { model: string; provider: ProviderName }
> = {
  'gpt-4o': { model: 'gpt-4o-mini', provider: ProviderName.OPENAI },
  'claude-sonnet-4': {
    model: 'claude-haiku',
    provider: ProviderName.ANTHROPIC,
  },
  'gemini-2.0-pro': {
    model: 'gemini-2.0-flash',
    provider: ProviderName.GEMINI,
  },
  'o3-mini': { model: 'gpt-4o-mini', provider: ProviderName.OPENAI },
};

export type OptimizationInsight = {
  id: string;
  type: 'model_downgrade' | 'provider_consolidation' | 'idle_spend';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedMonthlySavings: number;
  actionLabel: string;
  actionHref: string;
  applyable?: boolean;
  denyModel?: string;
  suggestModel?: string;
};

export type AnomalyInsight = {
  id: string;
  type: 'spend_spike' | 'model_spike' | 'user_spike' | 'request_spike';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric: string;
  value: number;
  baseline: number;
  zScore?: number;
  detectedAt: string;
  actionLabel: string;
  actionHref: string;
};

export type CostSimulationResult = {
  periodDays: number;
  currentMonthlyProjected: number;
  projectedMonthly: number;
  monthlySavings: number;
  savingsPercent: number;
  breakdown: {
    fromModel: string;
    toModel: string;
    provider: string;
    currentCost: number;
    projectedCost: number;
    savings: number;
    requests: number;
  }[];
};
