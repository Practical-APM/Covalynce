import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CredentialsService } from '../common/credentials.service';
import { InstanceSettingsController } from './instance-settings.controller';
import { InstanceSettingsService } from './instance-settings.service';

@Module({
  imports: [AuditModule],
  controllers: [InstanceSettingsController],
  providers: [InstanceSettingsService, CredentialsService],
  exports: [InstanceSettingsService],
})
export class InstanceSettingsModule {}
