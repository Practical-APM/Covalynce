import { forwardRef, Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [JwtAuthModule, forwardRef(() => RbacModule)],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
