import type { CanonicalUsageEvent } from './provider-adapter.interface';

const BILLING_ACCOUNTS_URL =
  'https://cloudbilling.googleapis.com/v1/billingAccounts';

export async function fetchGeminiUsageEvents(
  accessToken: string,
  since: Date,
): Promise<CanonicalUsageEvent[]> {
  void since;
  const res = await fetch(BILLING_ACCOUNTS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) {
    throw new Error(
      'Google OAuth token expired or invalid. Reconnect Gemini via OAuth.',
    );
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Google Cloud Billing API error (${res.status}): ${text.slice(0, 160)}`,
    );
  }

  throw new Error(
    'Gemini token-level billing sync requires GCP BigQuery billing export. ' +
      'Use sk-demo-* for sample data, or route LLM traffic through the Covalynce Gateway for live attribution.',
  );
}

export function geminiApiKeyLiveSyncMessage(): string {
  return (
    'Gemini API keys cannot read organization billing. Connect via Google OAuth ' +
    '(for billing account verification) or use the Gateway for live usage. ' +
    'Use sk-demo-* for sample dashboard data.'
  );
}
