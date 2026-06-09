import { ProviderName } from '@prisma/client';
import type { CanonicalUsageEvent } from './provider-adapter.interface';

const USAGE_URL =
  'https://api.anthropic.com/v1/organizations/usage_report/messages';

type AnthropicUsagePage = {
  data: {
    starting_at: string;
    ending_at: string;
    results: {
      model: string | null;
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
      workspace_id?: string | null;
    }[];
  }[];
  has_more?: boolean;
  next_page?: string;
};

function parseAnthropicError(status: number, body: string): string {
  try {
    const json = JSON.parse(body) as { error?: { message?: string } };
    if (json.error?.message) return json.error.message;
  } catch {
    /* plain */
  }
  if (status === 401) return 'Invalid Anthropic API key or OAuth token.';
  if (status === 403) {
    return (
      'Anthropic Admin API access required (sk-ant-admin… key or OAuth with usage:read). ' +
      'Standard API keys cannot read organization usage.'
    );
  }
  return `Anthropic usage API error (${status})`;
}

export async function fetchAnthropicUsageEvents(
  apiKey: string,
  since: Date,
): Promise<CanonicalUsageEvent[]> {
  const events: CanonicalUsageEvent[] = [];
  let nextPage: string | undefined;

  do {
    const params = new URLSearchParams({
      starting_at: since.toISOString(),
      ending_at: new Date().toISOString(),
      bucket_width: '1d',
    });
    params.append('group_by[]', 'model');
    if (nextPage) params.set('page', nextPage);

    const res = await fetch(`${USAGE_URL}?${params.toString()}`, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(parseAnthropicError(res.status, text));
    }

    const page = (await res.json()) as AnthropicUsagePage;
    for (const bucket of page.data ?? []) {
      const bucketStart = new Date(bucket.starting_at);
      if (bucketStart < since) continue;

      for (let i = 0; i < (bucket.results ?? []).length; i++) {
        const row = bucket.results[i];
        const input = row.input_tokens + (row.cache_read_input_tokens ?? 0);
        const output = row.output_tokens;
        if (input === 0 && output === 0) continue;

        const model = row.model ?? 'unknown';
        const ws = row.workspace_id ? `-${row.workspace_id}` : '';
        events.push({
          externalId: `anthropic-${bucket.starting_at}-${model}${ws}-${i}`,
          provider: ProviderName.ANTHROPIC,
          model,
          inputTokens: input,
          outputTokens: output,
          timestamp: bucketStart,
        });
      }
    }

    nextPage = page.has_more ? page.next_page : undefined;
  } while (nextPage);

  return events;
}
