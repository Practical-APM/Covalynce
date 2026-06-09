import { ProviderName } from '@prisma/client';
import type { CanonicalUsageEvent } from './provider-adapter.interface';

const USAGE_URL = 'https://api.openai.com/v1/organization/usage/completions';

type UsageBucket = {
  object: string;
  start_time: number;
  end_time: number;
  results: UsageResult[];
};

type UsageResult = {
  object: string;
  input_tokens: number;
  output_tokens: number;
  num_model_requests: number;
  model: string | null;
  user_id: string | null;
  project_id: string | null;
  api_key_id: string | null;
};

type UsagePage = {
  data: UsageBucket[];
  has_more?: boolean;
  next_page?: string;
};

function parseUsageError(status: number, body: string): string {
  try {
    const json = JSON.parse(body) as { error?: { message?: string } };
    if (json.error?.message) return json.error.message;
  } catch {
    /* plain text */
  }
  if (status === 401) {
    return 'Invalid OpenAI API key.';
  }
  if (status === 403) {
    return (
      'OpenAI admin key with api.usage.read scope required for live sync. ' +
      'Use an organization admin key, or connect with a demo key for sample data.'
    );
  }
  return `OpenAI usage API error (${status})`;
}

export async function fetchOpenAiUsageEvents(
  apiKey: string,
  since: Date,
): Promise<CanonicalUsageEvent[]> {
  const startTime = Math.floor(since.getTime() / 1000);
  const endTime = Math.floor(Date.now() / 1000);
  const events: CanonicalUsageEvent[] = [];
  let nextPage: string | undefined;

  do {
    const params = new URLSearchParams({
      start_time: String(startTime),
      end_time: String(endTime),
      bucket_width: '1d',
      limit: '31',
      group_by: 'model',
    });
    params.append('group_by', 'user_id');
    if (nextPage) {
      params.set('page', nextPage);
    }

    const res = await fetch(`${USAGE_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(parseUsageError(res.status, text));
    }

    const page = (await res.json()) as UsagePage;
    for (const bucket of page.data ?? []) {
      const bucketStart = new Date(bucket.start_time * 1000);
      if (bucketStart < since) continue;

      for (let i = 0; i < (bucket.results ?? []).length; i++) {
        const row = bucket.results[i];
        if (row.input_tokens === 0 && row.output_tokens === 0) continue;

        const model = row.model ?? 'unknown';
        const userSuffix = row.user_id ? `-${row.user_id}` : '';
        events.push({
          externalId: `openai-${bucket.start_time}-${model}${userSuffix}-${i}`,
          provider: ProviderName.OPENAI,
          model,
          inputTokens: row.input_tokens,
          outputTokens: row.output_tokens,
          timestamp: bucketStart,
          userEmail: row.user_id ? `${row.user_id}@openai.user` : undefined,
        });
      }
    }

    nextPage = page.has_more ? page.next_page : undefined;
  } while (nextPage);

  return events;
}
