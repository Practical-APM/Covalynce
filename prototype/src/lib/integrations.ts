/** Client-side integration auth preferences (mirrors INTEGRATIONS_STRATEGY.md) */

import type { ConnectableProviderName } from "./provider-types";

export type IntegrationAuthMethod = "oauth" | "api_key" | "webhook" | "jwt";

export interface IntegrationInfo {
  id: string;
  name: string;
  preferredAuth: IntegrationAuthMethod;
  supportedAuth: IntegrationAuthMethod[];
  oauthAvailable: boolean;
  description: string;
}

export const PROVIDER_INTEGRATIONS: Record<
  ConnectableProviderName,
  { label: string; preferredAuth: IntegrationAuthMethod; oauthAvailable: boolean }
> = {
  OPENAI: {
    label: "OpenAI",
    preferredAuth: "oauth",
    oauthAvailable: true,
  },
  ANTHROPIC: {
    label: "Anthropic",
    preferredAuth: "oauth",
    oauthAvailable: true,
  },
  GEMINI: {
    label: "Google Gemini",
    preferredAuth: "oauth",
    oauthAvailable: true,
  },
  AZURE_OPENAI: {
    label: "Azure OpenAI",
    preferredAuth: "api_key",
    oauthAvailable: false,
  },
  BEDROCK: {
    label: "AWS Bedrock",
    preferredAuth: "api_key",
    oauthAvailable: false,
  },
};
