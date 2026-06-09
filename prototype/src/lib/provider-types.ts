/** Provider names supported by the connect API (matches Prisma ProviderName). */

export const CONNECTABLE_PROVIDERS = [
  "OPENAI",
  "ANTHROPIC",
  "GEMINI",
  "AZURE_OPENAI",
  "BEDROCK",
] as const;

export type ConnectableProviderName = (typeof CONNECTABLE_PROVIDERS)[number];

export const OAUTH_PROVIDERS = [
  "OPENAI",
  "ANTHROPIC",
  "GEMINI",
] as const;

export type OAuthProviderName = (typeof OAUTH_PROVIDERS)[number];

export function providerSupportsOAuth(
  name: ConnectableProviderName,
): name is OAuthProviderName {
  return (OAUTH_PROVIDERS as readonly string[]).includes(name);
}

export const PROVIDER_LABELS: Record<ConnectableProviderName, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GEMINI: "Google Gemini",
  AZURE_OPENAI: "Azure OpenAI",
  BEDROCK: "AWS Bedrock",
};

export const PROVIDER_HINTS: Record<ConnectableProviderName, string> = {
  OPENAI: "GPT-4o, o3, embeddings, and usage APIs",
  ANTHROPIC: "Claude Sonnet, Opus, Haiku via Admin API",
  GEMINI: "Gemini Pro, Flash via Google Cloud billing",
  AZURE_OPENAI: "Demo + Gateway today — native billing sync on the roadmap",
  BEDROCK: "Demo + Gateway today — native billing sync on the roadmap",
};
