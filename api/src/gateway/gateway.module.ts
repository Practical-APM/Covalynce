import { Module } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module';
import { AuditModule } from '../audit/audit.module';
import { CacheModule } from '../cache/cache.module';
import { CredentialsService } from '../common/credentials.service';
import { CostEngine } from '../cost/cost-engine';
import { PoliciesModule } from '../policies/policies.module';
import { RbacModule } from '../rbac/rbac.module';
import { GatewayController } from './gateway.controller';
import { GatewayKeyGuard } from './gateway-key.guard';
import { GatewayKeysService } from './gateway-keys.service';
import { GatewayProxyService } from './gateway-proxy.service';
import { GatewayRateLimitService } from './gateway-rate-limit.service';
import { ModelRouterService } from './model-router.service';

@Module({
  imports: [PoliciesModule, AuditModule, CacheModule, AgentsModule, RbacModule],
  controllers: [GatewayController],
  providers: [
    GatewayKeysService,
    GatewayProxyService,
    GatewayRateLimitService,
    GatewayKeyGuard,
    ModelRouterService,
    CostEngine,
    CredentialsService,
  ],
  exports: [GatewayKeysService, GatewayProxyService, ModelRouterService],
})
export class GatewayModule {}
