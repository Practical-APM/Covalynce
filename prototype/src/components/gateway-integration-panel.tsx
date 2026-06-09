"use client";

import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function GatewayIntegrationPanel() {
  const unifiedSnippet = `from openai import OpenAI

client = OpenAI(
  api_key="gk_your_key_here",
  base_url="${API_BASE}/api/v1/gateway/v1/route",
  default_headers={
    "X-Covalynce-Agent-Id": "support-bot",
    "X-Covalynce-Project-Tag": "ENG-PLATFORM",
  },
)

response = client.chat.completions.create(
  model="gpt-4o",
  messages=[{"role": "user", "content": "Hello"}],
)`;

  const openaiSnippet = `from openai import OpenAI

client = OpenAI(
  api_key="gk_your_key_here",
  base_url="${API_BASE}/api/v1/gateway/v1",
)

response = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[{"role": "user", "content": "Hello"}],
  stream=True,
)`;

  const anthropicSnippet = `curl -X POST ${API_BASE}/api/v1/gateway/anthropic/v1/messages \\
  -H "Authorization: Bearer gk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"claude-haiku","max_tokens":256,"messages":[{"role":"user","content":"Hello"}]}'`;

  const geminiSnippet = `curl -X POST ${API_BASE}/api/v1/gateway/gemini/v1/generate \\
  -H "Authorization: Bearer gk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gemini-2.0-flash","contents":[{"parts":[{"text":"Hello"}]}]}'`;

  return (
    <div className="surface-panel overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">Integration examples</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Copy a snippet for your stack. Use a gateway key (gk_…), not your user
          JWT. Full reference in{" "}
          <a href="/help/api/gateway" className="font-medium text-foreground underline underline-offset-4">
            API docs
          </a>
          .
        </p>
      </div>
      <Tabs defaultValue="unified" className="gap-0">
        <TabsList variant="line" className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent px-5">
          <TabsTrigger value="unified" className="rounded-none px-3 py-3">
            Unified route
          </TabsTrigger>
          <TabsTrigger value="openai" className="rounded-none px-3 py-3">
            OpenAI
          </TabsTrigger>
          <TabsTrigger value="anthropic" className="rounded-none px-3 py-3">
            Anthropic
          </TabsTrigger>
          <TabsTrigger value="gemini" className="rounded-none px-3 py-3">
            Gemini
          </TabsTrigger>
        </TabsList>
        <TabsContent value="unified" className="p-5 pt-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Recommended: one endpoint picks the provider from the model name.
          </p>
          <CodeBlock code={unifiedSnippet} language="python" title="Python" />
        </TabsContent>
        <TabsContent value="openai" className="p-5 pt-4">
          <CodeBlock code={openaiSnippet} language="python" title="Python" />
        </TabsContent>
        <TabsContent value="anthropic" className="p-5 pt-4">
          <CodeBlock code={anthropicSnippet} language="curl" title="cURL" />
        </TabsContent>
        <TabsContent value="gemini" className="p-5 pt-4">
          <CodeBlock code={geminiSnippet} language="curl" title="cURL" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
