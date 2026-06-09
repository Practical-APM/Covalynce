export function azureOpenAiLiveSyncMessage(): string {
  return (
    'Azure OpenAI native billing sync is not implemented yet. ' +
    'Use sk-demo-* for sample data, route Azure traffic through the Covalynce Gateway ' +
    '(with X-Covalynce-Project-Tag for chargeback), or export from Azure Cost Management manually.'
  );
}

export function bedrockLiveSyncMessage(): string {
  return (
    'AWS Bedrock native billing sync is not implemented yet. ' +
    'Use sk-demo-* for sample data, route Bedrock traffic through the Covalynce Gateway ' +
    '(with X-Covalynce-Project-Tag for chargeback), or use AWS Cost Explorer for reconciliation.'
  );
}
