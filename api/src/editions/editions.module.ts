import { Global, Module } from '@nestjs/common';
import { EditionsController } from './editions.controller';
import { EditionsService } from './editions.service';
import { EnterpriseFeatureGuard } from './enterprise-feature.guard';

@Global()
@Module({
  controllers: [EditionsController],
  providers: [EditionsService, EnterpriseFeatureGuard],
  exports: [EditionsService, EnterpriseFeatureGuard],
})
export class EditionsModule {}
