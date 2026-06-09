import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProviderName } from '@prisma/client';
import { CredentialsService } from '../common/credentials.service';
import { CostEngine } from '../cost/cost-engine';
import { PolicyEngineService } from '../policies/policy-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { resolveApiKey } from '../providers/adapters/provider-adapter.interface';
import { parseStoredProviderCredentials } from '../providers/credentials.util';
import type { GatewayContext } from './gateway.types';
import { isDemoKey } from './gateway.types';
import { ModelRouterService } from './model-router.service';

type OpenAiBody = {
  model: string;
  messages?: unknown[];
  max_tokens?: number;
  stream?: boolean;
  stream_options?: { include_usage?: boolean };
};

type AnthropicBody = {
  model: string;
  max_tokens: number;
  messages: { role: string; content: string }[];
  stream?: boolean;
};

type GeminiBody = {
  model: string;
  contents: { role?: string; parts: { text: string }[] }[];
  stream?: boolean;
};

type UnifiedBody = {
  model: string;
  messages?: { role: string; content: string }[];
  max_tokens?: number;
  stream?: boolean;
};

@Injectable()
export class GatewayProxyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentials: CredentialsService,
    private readonly policyEngine: PolicyEngineService,
    private readonly costEngine: CostEngine,
    private readonly modelRouter: ModelRouterService,
  ) {}

  async openAiChat(ctx: GatewayContext, body: OpenAiBody) {
    const { model, providerRecord, creds } = await this.prepareProvider(
      ctx,
      ProviderName.OPENAI,
      body.model,
    );

    if (body.stream) {
      throw new ForbiddenException(
        'Use streaming endpoint handler for stream: true',
      );
    }

    let response: {
      usage: { prompt_tokens: number; completion_tokens: number };
      [key: string]: unknown;
    };

    if (isDemoKey(creds.apiKey)) {
      response = this.demoOpenAiCompletion(body.model);
    } else {
      const upstream = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${creds.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );
      if (!upstream.ok) {
        throw await this.upstreamError('OpenAI', upstream);
      }
      response = (await upstream.json()) as typeof response;
    }

    await this.recordUsage(
      ctx,
      providerRecord.id,
      ProviderName.OPENAI,
      model,
      response.usage.prompt_tokens,
      response.usage.completion_tokens,
    );

    return response;
  }

  async openAiChatStream(ctx: GatewayContext, body: OpenAiBody, res: Response) {
    const { model, providerRecord, creds } = await this.prepareProvider(
      ctx,
      ProviderName.OPENAI,
      body.model,
    );

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (isDemoKey(creds.apiKey)) {
      const demo = this.demoOpenAiCompletion(model);
      const chunk = {
        id: demo.id,
        object: 'chat.completion.chunk',
        created: demo.created,
        model,
        choices: [
          {
            index: 0,
            delta: {
              role: 'assistant',
              content: demo.choices[0].message.content,
            },
            finish_reason: null,
          },
        ],
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      const done = {
        ...chunk,
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
      };
      res.write(`data: ${JSON.stringify(done)}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      await this.recordUsage(
        ctx,
        providerRecord.id,
        ProviderName.OPENAI,
        model,
        demo.usage.prompt_tokens,
        demo.usage.completion_tokens,
      );
      return;
    }

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        stream: true,
        stream_options: { include_usage: true },
      }),
    });

    if (!upstream.ok || !upstream.body) {
      throw await this.upstreamError('OpenAI', upstream);
    }

    let inputTokens = 0;
    let outputTokens = 0;
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      buffer += text;
      res.write(text);

      for (const line of buffer.split('\n')) {
        if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
        try {
          const payload = JSON.parse(line.slice(6)) as {
            usage?: { prompt_tokens?: number; completion_tokens?: number };
          };
          if (payload.usage?.prompt_tokens) {
            inputTokens = payload.usage.prompt_tokens;
            outputTokens = payload.usage.completion_tokens ?? outputTokens;
          }
        } catch {
          /* partial SSE line */
        }
      }
      buffer = buffer.slice(-512);
    }

    res.end();

    if (inputTokens === 0) {
      inputTokens = 100;
      outputTokens = 40;
    }

    await this.recordUsage(
      ctx,
      providerRecord.id,
      ProviderName.OPENAI,
      model,
      inputTokens,
      outputTokens,
    );
  }

  async anthropicMessages(ctx: GatewayContext, body: AnthropicBody) {
    const { model, providerRecord, creds } = await this.prepareProvider(
      ctx,
      ProviderName.ANTHROPIC,
      body.model,
    );

    if (body.stream) {
      throw new ForbiddenException(
        'Anthropic streaming: set stream false or use dedicated stream handler',
      );
    }

    let response: {
      usage: { input_tokens: number; output_tokens: number };
      [key: string]: unknown;
    };

    if (isDemoKey(creds.apiKey)) {
      response = this.demoAnthropicCompletion(body.model);
    } else {
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': creds.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!upstream.ok) {
        throw await this.upstreamError('Anthropic', upstream);
      }
      response = (await upstream.json()) as typeof response;
    }

    await this.recordUsage(
      ctx,
      providerRecord.id,
      ProviderName.ANTHROPIC,
      model,
      response.usage.input_tokens,
      response.usage.output_tokens,
    );

    return response;
  }

  async anthropicMessagesStream(
    ctx: GatewayContext,
    body: AnthropicBody,
    res: Response,
  ) {
    const { model, providerRecord, creds } = await this.prepareProvider(
      ctx,
      ProviderName.ANTHROPIC,
      body.model,
    );

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (isDemoKey(creds.apiKey)) {
      const demo = this.demoAnthropicCompletion(model);
      const text =
        (demo.content as { type: string; text: string }[])[0]?.text ?? 'Demo';
      res.write(
        `event: message_start\ndata: ${JSON.stringify({ type: 'message_start', message: { usage: { input_tokens: demo.usage.input_tokens } } })}\n\n`,
      );
      res.write(
        `event: content_block_delta\ndata: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`,
      );
      res.write(
        `event: message_delta\ndata: ${JSON.stringify({ type: 'message_delta', usage: { output_tokens: demo.usage.output_tokens } })}\n\n`,
      );
      res.write(
        `event: message_stop\ndata: ${JSON.stringify({ type: 'message_stop' })}\n\n`,
      );
      res.end();
      await this.recordUsage(
        ctx,
        providerRecord.id,
        ProviderName.ANTHROPIC,
        model,
        demo.usage.input_tokens,
        demo.usage.output_tokens,
      );
      return;
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': creds.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, stream: true }),
    });

    if (!upstream.ok || !upstream.body) {
      throw await this.upstreamError('Anthropic', upstream);
    }

    let inputTokens = 0;
    let outputTokens = 0;
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      res.write(text);

      for (const line of text.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        try {
          const payload = JSON.parse(line.slice(6)) as {
            type?: string;
            message?: { usage?: { input_tokens?: number } };
            usage?: { output_tokens?: number };
          };
          if (payload.type === 'message_start' && payload.message?.usage) {
            inputTokens = payload.message.usage.input_tokens ?? inputTokens;
          }
          if (payload.type === 'message_delta' && payload.usage) {
            outputTokens = payload.usage.output_tokens ?? outputTokens;
          }
        } catch {
          /* ignore */
        }
      }
    }

    res.end();

    if (inputTokens === 0) {
      inputTokens = 100;
      outputTokens = 40;
    }

    await this.recordUsage(
      ctx,
      providerRecord.id,
      ProviderName.ANTHROPIC,
      model,
      inputTokens,
      outputTokens,
    );
  }

  async geminiGenerate(ctx: GatewayContext, body: GeminiBody) {
    const { model, providerRecord, creds } = await this.prepareProvider(
      ctx,
      ProviderName.GEMINI,
      body.model,
    );

    let response: {
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
      };
      [key: string]: unknown;
    };

    if (isDemoKey(creds.apiKey)) {
      response = this.demoGeminiCompletion(body.model);
    } else {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(creds.apiKey)}`;
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: body.contents }),
      });
      if (!upstream.ok) {
        throw await this.upstreamError('Gemini', upstream);
      }
      response = (await upstream.json()) as typeof response;
    }

    const input = response.usageMetadata?.promptTokenCount ?? 100;
    const output = response.usageMetadata?.candidatesTokenCount ?? 40;

    await this.recordUsage(
      ctx,
      providerRecord.id,
      ProviderName.GEMINI,
      model,
      input,
      output,
    );

    return response;
  }

  async geminiGenerateStream(
    ctx: GatewayContext,
    body: GeminiBody,
    res: Response,
  ) {
    const { model, providerRecord, creds } = await this.prepareProvider(
      ctx,
      ProviderName.GEMINI,
      body.model,
    );

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (isDemoKey(creds.apiKey)) {
      const demo = this.demoGeminiCompletion(body.model);
      res.write(`data: ${JSON.stringify({ candidates: demo.candidates })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      await this.recordUsage(
        ctx,
        providerRecord.id,
        ProviderName.GEMINI,
        model,
        90,
        35,
      );
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(creds.apiKey)}`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: body.contents }),
    });

    if (!upstream.ok || !upstream.body) {
      throw await this.upstreamError('Gemini', upstream);
    }

    let inputTokens = 0;
    let outputTokens = 0;
    const decoder = new TextDecoder();
    const reader = upstream.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      res.write(text);

      for (const line of text.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        try {
          const chunk = JSON.parse(line.slice(6)) as {
            usageMetadata?: {
              promptTokenCount?: number;
              candidatesTokenCount?: number;
            };
          };
          if (chunk.usageMetadata?.promptTokenCount) {
            inputTokens = chunk.usageMetadata.promptTokenCount;
          }
          if (chunk.usageMetadata?.candidatesTokenCount) {
            outputTokens = chunk.usageMetadata.candidatesTokenCount;
          }
        } catch {
          /* partial SSE chunk */
        }
      }
    }

    res.end();
    await this.recordUsage(
      ctx,
      providerRecord.id,
      ProviderName.GEMINI,
      model,
      inputTokens || 100,
      outputTokens || 40,
    );
  }

  private async prepareProvider(
    ctx: GatewayContext,
    providerName: ProviderName,
    model: string,
  ) {
    if (!model) {
      throw new ForbiddenException('model is required');
    }

    const policy = await this.policyEngine.evaluate({
      organizationId: ctx.organizationId,
      teamId: ctx.teamId,
      userId: ctx.userId,
      provider: providerName,
      model,
    });

    if (!policy.allowed) {
      throw new ForbiddenException({
        error: {
          message: policy.reason,
          type: 'policy_violation',
          code: 'budget_or_policy_blocked',
        },
      });
    }

    const providerRecord = await this.prisma.provider.findUnique({
      where: {
        organizationId_name: {
          organizationId: ctx.organizationId,
          name: providerName,
        },
      },
    });

    if (!providerRecord) {
      throw new NotFoundException(
        `${providerName} provider not connected — connect at /providers first`,
      );
    }

    const credsJson = this.credentials.decrypt(
      providerRecord.encryptedCredentials,
    );
    const parsed = parseStoredProviderCredentials(credsJson);
    const creds = { apiKey: resolveApiKey(parsed) };

    return { model, providerRecord, creds };
  }

  private async upstreamError(label: string, upstream: globalThis.Response) {
    const text = await upstream.text();
    return new ServiceUnavailableException(
      `Upstream ${label} error (${upstream.status}): ${text.slice(0, 200)}`,
    );
  }

  private demoOpenAiCompletion(model: string) {
    return {
      id: `chatcmpl-demo-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content:
              'Demo response from Covalynce Gateway (OpenAI). Connect a real API key for live completions.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 120, completion_tokens: 48, total_tokens: 168 },
    };
  }

  private demoAnthropicCompletion(model: string) {
    return {
      id: `msg-demo-${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model,
      content: [
        {
          type: 'text',
          text: 'Demo response from Covalynce Gateway (Anthropic).',
        },
      ],
      stop_reason: 'end_turn',
      usage: { input_tokens: 100, output_tokens: 42 },
    };
  }

  private demoGeminiCompletion(model: string) {
    return {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'Demo response from Covalynce Gateway (Gemini).',
              },
            ],
            role: 'model',
          },
        },
      ],
      modelVersion: model,
      usageMetadata: {
        promptTokenCount: 90,
        candidatesTokenCount: 35,
        totalTokenCount: 125,
      },
    };
  }

  private async recordUsage(
    ctx: GatewayContext,
    providerId: string,
    provider: ProviderName,
    model: string,
    inputTokens: number,
    outputTokens: number,
  ) {
    const now = new Date();
    const cost = await this.costEngine.calculateCost(
      provider,
      model,
      inputTokens,
      outputTokens,
      now,
    );

    const externalId = `gw-${ctx.keyId}-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      await this.prisma.usageEvent.create({
        data: {
          organizationId: ctx.organizationId,
          providerId,
          provider,
          model,
          userId: ctx.userId ?? null,
          teamId: ctx.teamId ?? null,
          agentId: ctx.agentId ?? null,
          projectTag: ctx.projectTag ?? null,
          inputTokens,
          outputTokens,
          cost,
          externalId,
          timestamp: now,
        },
      });
    } catch {
      /* duplicate */
    }
  }

  getStatus(organizationId: string) {
    return this.prisma.gatewayApiKey.count({
      where: { organizationId, enabled: true },
    });
  }

  async routeUnified(ctx: GatewayContext, body: UnifiedBody, res: Response) {
    if (!body.model) {
      throw new ForbiddenException('model is required');
    }

    if (ctx.agentId) {
      await this.modelRouter.checkAgentBudget(ctx.agentId, ctx.organizationId);
    }

    const route = await this.modelRouter.resolve(
      ctx.organizationId,
      body.model,
    );
    const routingMeta = {
      requested_model: route.requestedModel,
      routed_model: route.model,
      provider: route.provider,
      intelligent_routing: route.intelligentRouting,
      routed: route.routed,
    };

    res.setHeader('X-Covalynce-Routing', JSON.stringify(routingMeta));

    switch (route.provider) {
      case ProviderName.OPENAI: {
        const payload = { ...body, model: route.model };
        if (body.stream) {
          await this.openAiChatStream(ctx, payload, res);
          return;
        }
        const result = await this.openAiChat(ctx, payload);
        return { ...result, _covalynce: { routing: routingMeta } };
      }
      case ProviderName.ANTHROPIC: {
        const anthropicBody = {
          model: route.model,
          max_tokens: body.max_tokens ?? 1024,
          messages: body.messages ?? [],
          stream: body.stream,
        };
        if (body.stream) {
          await this.anthropicMessagesStream(ctx, anthropicBody, res);
          return;
        }
        const result = await this.anthropicMessages(ctx, anthropicBody);
        return { ...result, _covalynce: { routing: routingMeta } };
      }
      case ProviderName.GEMINI: {
        const geminiBody = {
          model: route.model,
          contents: this.openAiMessagesToGemini(body.messages),
          stream: body.stream,
        };
        if (body.stream) {
          await this.geminiGenerateStream(ctx, geminiBody, res);
          return;
        }
        const result = await this.geminiGenerate(ctx, geminiBody);
        return { ...result, _covalynce: { routing: routingMeta } };
      }
      default:
        throw new NotFoundException(
          `Provider ${route.provider} routing not supported`,
        );
    }
  }

  private openAiMessagesToGemini(
    messages?: { role: string; content: string }[],
  ) {
    return (messages ?? []).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }
}
