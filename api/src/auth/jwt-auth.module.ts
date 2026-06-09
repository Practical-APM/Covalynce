import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') ?? 'covalynce-dev-secret-change-me',
        signOptions: {
          expiresIn: (() => {
            const raw = config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
            if (raw.endsWith('m')) return parseInt(raw, 10) * 60;
            if (raw.endsWith('h')) return parseInt(raw, 10) * 3600;
            return 900;
          })(),
        },
      }),
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [PassportModule, JwtModule, JwtStrategy, JwtAuthGuard],
})
export class JwtAuthModule {}
