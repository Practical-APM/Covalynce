import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GatewayKeysService } from './gateway-keys.service';
import { GatewayRateLimitService } from './gateway-rate-limit.service';
import { AgentsService } from '../agents/agents.service';
import type { GatewayContext } from './gateway.types';

@Injectable()
export class GatewayKeyGuard implements CanActivate {
  constructor(
    private readonly keys: GatewayKeysService,
    private readonly rateLimit: GatewayRateLimitService,
    private readonly agents: AgentsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      gateway?: GatewayContext;
    }>();

    const auth = req.headers.authorization;
    const rawKey = auth?.startsWith('Bearer ')
      ? auth.slice(7)
      : req.headers['x-covalynce-key'];

    if (!rawKey?.startsWith('gk_')) {
      throw new UnauthorizedException('Invalid gateway API key');
    }

    const resolved = await this.keys.validateKey(rawKey);
    if (!resolved) {
      throw new UnauthorizedException('Invalid or disabled gateway API key');
    }

    await this.rateLimit.check(resolved.keyId, resolved.rateLimitRpm);

    let agentId: string | undefined;
    const agentRef = req.headers['x-covalynce-agent-id'];
    if (agentRef) {
      const agent = await this.agents.resolveAgent(
        resolved.organizationId,
        agentRef,
      );
      agentId = agent?.id;
    }

    req.gateway = {
      organizationId: resolved.organizationId,
      keyId: resolved.keyId,
      rateLimitRpm: resolved.rateLimitRpm,
      userId: req.headers['x-covalynce-user-id'],
      teamId: req.headers['x-covalynce-team-id'],
      agentId,
      projectTag: req.headers['x-covalynce-project-tag'],
    };

    return true;
  }
}
