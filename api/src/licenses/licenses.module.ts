import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { RbacModule } from '../rbac/rbac.module';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';

@Module({
  imports: [AuditModule, RbacModule],
  controllers: [LicensesController],
  providers: [LicensesService],
})
export class LicensesModule {}
