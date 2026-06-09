import { Module } from '@nestjs/common';
import { PoliciesModule } from '../policies/policies.module';
import { RbacModule } from '../rbac/rbac.module';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';

@Module({
  imports: [PoliciesModule, RbacModule],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
