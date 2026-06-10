import { Module, forwardRef } from '@nestjs/common';
import { CostEngine } from '../cost/cost-engine';
import { CredentialsService } from '../common/credentials.service';
import { InstanceSettingsModule } from '../instance-settings/instance-settings.module';
import { JobsModule } from '../jobs/jobs.module';
import { RbacModule } from '../rbac/rbac.module';
import { ProviderAdapterRegistry } from './adapters/provider-adapters';
import { ProvidersController } from './providers.controller';
import { ProviderOAuthService } from './provider-oauth.service';
import { ProvidersService } from './providers.service';

@Module({
  imports: [forwardRef(() => JobsModule), InstanceSettingsModule, RbacModule],
  controllers: [ProvidersController],
  providers: [
    ProvidersService,
    ProviderOAuthService,
    ProviderAdapterRegistry,
    CredentialsService,
    CostEngine,
  ],
  exports: [ProvidersService],
})
export class ProvidersModule {}
