import { Injectable } from '@nestjs/common';
import { ProviderName } from '@prisma/client';
import { isSampleProviderCredentials } from '../credentials.util';
import { fetchAnthropicUsageEvents } from './anthropic-usage.sync';
import {
  fetchGeminiUsageEvents,
  geminiApiKeyLiveSyncMessage,
} from './gemini-usage.sync';
import {
  azureOpenAiLiveSyncMessage,
  bedrockLiveSyncMessage,
} from './planned-provider.messages';
import { fetchOpenAiUsageEvents } from './openai-usage.sync';
import {
  CanonicalUsageEvent,
  ProviderAdapter,
  ProviderAdapterFactory,
  ProviderCredentials,
  resolveApiKey,
} from './provider-adapter.interface';

function demoEvents(
  provider: ProviderName,
  since: Date,
  models: string[],
): CanonicalUsageEvent[] {
  const events: CanonicalUsageEvent[] = [];
  const now = new Date();
  for (let day = 0; day < 3; day++) {
    const ts = new Date(now);
    ts.setUTCDate(ts.getUTCDate() - day);
    if (ts < since) continue;
    for (let i = 0; i < 5; i++) {
      const model = models[i % models.length];
      events.push({
        externalId: `${provider.toLowerCase()}-sample-${ts.toISOString().slice(0, 10)}-${i}`,
        provider,
        model,
        inputTokens: 800 + i * 120 + day * 50,
        outputTokens: 200 + i * 40,
        timestamp: ts,
        userEmail: `user${(i % 3) + 1}@acme.com`,
      });
    }
  }
  return events;
}

abstract class BaseProviderAdapter implements ProviderAdapter {
  abstract readonly name: ProviderName;
  protected abstract models: string[];
  protected abstract keyPrefix: string;
  protected abstract liveSyncLabel: string;

  validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const key = resolveApiKey(credentials);
    if (!key) return Promise.resolve(false);
    if (isSampleProviderCredentials(credentials)) return Promise.resolve(true);
    if (credentials.authType === 'OAUTH') {
      return Promise.resolve(key.length > 8);
    }
    return Promise.resolve(key.startsWith(this.keyPrefix));
  }

  async syncUsage(
    credentials: ProviderCredentials,
    since: Date,
  ): Promise<CanonicalUsageEvent[]> {
    if (isSampleProviderCredentials(credentials)) {
      return demoEvents(this.name, since, this.models);
    }
    return this.syncLiveUsage(credentials, since);
  }

  protected syncLiveUsage(
    credentials: ProviderCredentials,
    since: Date,
  ): Promise<CanonicalUsageEvent[]> {
    void credentials;
    void since;
    return Promise.reject(
      new Error(
        `${this.liveSyncLabel} is not implemented yet. Use a demo key (sk-demo-*) for sample data, or route traffic through the Gateway for live attribution.`,
      ),
    );
  }
}

class OpenAiAdapter extends BaseProviderAdapter {
  readonly name = ProviderName.OPENAI;
  protected models = ['gpt-4o', 'gpt-4o-mini', 'o3-mini'];
  protected keyPrefix = 'sk-';
  protected liveSyncLabel = 'OpenAI live billing sync';

  protected async syncLiveUsage(
    credentials: ProviderCredentials,
    since: Date,
  ): Promise<CanonicalUsageEvent[]> {
    const key = resolveApiKey(credentials);
    if (!key) {
      throw new Error('Missing OpenAI credentials');
    }
    return fetchOpenAiUsageEvents(key, since);
  }
}

class AnthropicAdapter extends BaseProviderAdapter {
  readonly name = ProviderName.ANTHROPIC;
  protected models = ['claude-sonnet-4', 'claude-haiku'];
  protected keyPrefix = 'sk-ant-';
  protected liveSyncLabel = 'Anthropic live billing sync';

  protected async syncLiveUsage(
    credentials: ProviderCredentials,
    since: Date,
  ): Promise<CanonicalUsageEvent[]> {
    const key = resolveApiKey(credentials);
    if (!key) throw new Error('Missing Anthropic credentials');
    if (credentials.authType === 'API_KEY' && !key.startsWith('sk-ant-admin')) {
      throw new Error(
        'Anthropic live sync requires an Admin API key (sk-ant-admin…). ' +
          'Standard keys cannot read org usage. Use sk-demo-* for sample data.',
      );
    }
    return fetchAnthropicUsageEvents(key, since);
  }
}

class GeminiAdapter extends BaseProviderAdapter {
  readonly name = ProviderName.GEMINI;
  protected models = ['gemini-2.0-flash', 'gemini-2.0-pro'];
  protected keyPrefix = 'AIza';
  protected liveSyncLabel = 'Google Gemini live billing sync';

  protected async syncLiveUsage(
    credentials: ProviderCredentials,
    since: Date,
  ): Promise<CanonicalUsageEvent[]> {
    if (credentials.authType === 'API_KEY') {
      throw new Error(geminiApiKeyLiveSyncMessage());
    }
    const token = credentials.accessToken;
    if (!token) throw new Error('Missing Google OAuth access token');
    return fetchGeminiUsageEvents(token, since);
  }
}

class AzureOpenAiAdapter extends BaseProviderAdapter {
  readonly name = ProviderName.AZURE_OPENAI;
  protected models = ['gpt-4o', 'gpt-4o-mini'];
  protected keyPrefix = 'sk-';
  protected liveSyncLabel = 'Azure OpenAI live billing sync';

  validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const key = resolveApiKey(credentials);
    if (!key) return Promise.resolve(false);
    if (isSampleProviderCredentials(credentials)) return Promise.resolve(true);
    return Promise.resolve(key.length >= 8);
  }

  protected syncLiveUsage(): Promise<CanonicalUsageEvent[]> {
    return Promise.reject(new Error(azureOpenAiLiveSyncMessage()));
  }
}

class BedrockAdapter extends BaseProviderAdapter {
  readonly name = ProviderName.BEDROCK;
  protected models = ['anthropic.claude-3-haiku', 'amazon.titan-text'];
  protected keyPrefix = 'AKIA';
  protected liveSyncLabel = 'AWS Bedrock live billing sync';

  validateCredentials(credentials: ProviderCredentials): Promise<boolean> {
    const key = resolveApiKey(credentials);
    if (!key) return Promise.resolve(false);
    if (isSampleProviderCredentials(credentials)) return Promise.resolve(true);
    return Promise.resolve(key.length >= 8);
  }

  protected syncLiveUsage(): Promise<CanonicalUsageEvent[]> {
    return Promise.reject(new Error(bedrockLiveSyncMessage()));
  }
}

@Injectable()
export class ProviderAdapterRegistry implements ProviderAdapterFactory {
  private readonly adapters = new Map<ProviderName, ProviderAdapter>([
    [ProviderName.OPENAI, new OpenAiAdapter()],
    [ProviderName.ANTHROPIC, new AnthropicAdapter()],
    [ProviderName.GEMINI, new GeminiAdapter()],
    [ProviderName.AZURE_OPENAI, new AzureOpenAiAdapter()],
    [ProviderName.BEDROCK, new BedrockAdapter()],
  ]);

  getAdapter(name: ProviderName): ProviderAdapter {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`No adapter for provider ${name}`);
    }
    return adapter;
  }
}
