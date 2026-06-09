import { forwardRef, Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { AuditModule } from '../audit/audit.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuthBootstrapService } from './auth-bootstrap.service';
import { AuthController } from './auth.controller';
import { AuthModeService } from './auth-mode.service';
import { AuthService } from './auth.service';
import { JwtAuthModule } from './jwt-auth.module';
import { MagicLinkService } from './magic-link.service';
import { RefreshTokenService } from './refresh-token.service';
import { SsoController } from './sso.controller';
import { SsoService } from './sso.service';

@Module({
  imports: [
    JwtAuthModule,
    AuditModule,
    AlertsModule,
    forwardRef(() => RbacModule),
  ],
  controllers: [AuthController, SsoController],
  providers: [
    AuthService,
    AuthModeService,
    MagicLinkService,
    RefreshTokenService,
    AuthBootstrapService,
    SsoService,
  ],
  exports: [AuthService, AuthModeService, JwtAuthModule, SsoService],
})
export class AuthModule {}
