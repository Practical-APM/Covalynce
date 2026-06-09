import { ProviderName } from '@prisma/client';

/** Known cheaper alternatives for intelligent routing */
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

/** Infer provider from model name prefix */
export function inferProviderFromModel(model: string): ProviderName {
  const m = model.toLowerCase();
  if (m.startsWith('claude')) return ProviderName.ANTHROPIC;
  if (m.startsWith('gemini')) return ProviderName.GEMINI;
  if (
    m.startsWith('gpt') ||
    m.startsWith('o1') ||
    m.startsWith('o3') ||
    m.startsWith('text-embedding')
  ) {
    return ProviderName.OPENAI;
  }
  return ProviderName.OPENAI;
}

export type RouteResolution = {
  provider: ProviderName;
  model: string;
  requestedModel: string;
  intelligentRouting: boolean;
  routed: boolean;
};
