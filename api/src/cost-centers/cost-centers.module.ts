import { Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { RbacModule } from '../rbac/rbac.module';
import { CostCentersController } from './cost-centers.controller';
import { CostCentersService } from './cost-centers.service';

@Module({
  imports: [RbacModule, AlertsModule],
  controllers: [CostCentersController],
  providers: [CostCentersService],
  exports: [CostCentersService],
})
export class CostCentersModule {}
