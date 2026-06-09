export type GatewayContext = {
  organizationId: string;
  keyId: string;
  rateLimitRpm: number;
  userId?: string;
  teamId?: string;
  agentId?: string;
  projectTag?: string;
};

export function isDemoKey(apiKey: string) {
  return apiKey.startsWith('demo-') || apiKey.startsWith('sk-demo');
}

export const GATEWAY_ENDPOINTS = {
  unified: '/api/v1/gateway/v1/route/completions',
  openai: '/api/v1/gateway/v1/chat/completions',
  anthropic: '/api/v1/gateway/anthropic/v1/messages',
  gemini: '/api/v1/gateway/gemini/v1/generate',
} as const;
