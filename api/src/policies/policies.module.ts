import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { RbacModule } from '../rbac/rbac.module';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';
import { PolicyEngineService } from './policy-engine.service';

@Module({
  imports: [BudgetsModule, AuditModule, RbacModule],
  controllers: [PoliciesController],
  providers: [PoliciesService, PolicyEngineService],
  exports: [PoliciesService, PolicyEngineService],
})
export class PoliciesModule {}
