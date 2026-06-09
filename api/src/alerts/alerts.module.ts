import { Module } from '@nestjs/common';
import { BudgetsModule } from '../budgets/budgets.module';
import { AuditModule } from '../audit/audit.module';
import { RbacModule } from '../rbac/rbac.module';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [BudgetsModule, AuditModule, RbacModule],
  controllers: [AlertsController],
  providers: [AlertsService, NotificationsService],
  exports: [AlertsService, NotificationsService],
})
export class AlertsModule {}
