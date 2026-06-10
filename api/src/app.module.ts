import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from './audit/audit.module';
import { AgentsModule } from './agents/agents.module';
import { AlertsModule } from './alerts/alerts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { BudgetsModule } from './budgets/budgets.module';
import { CacheModule } from './cache/cache.module';
import { ComplianceModule } from './compliance/compliance.module';
import { CostCentersModule } from './cost-centers/cost-centers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EditionsModule } from './editions/editions.module';
import { EventsModule } from './events/events.module';
import { GatewayModule } from './gateway/gateway.module';
import { HealthModule } from './health/health.module';
import { InsightsModule } from './insights/insights.module';
import { InstanceSettingsModule } from './instance-settings/instance-settings.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { PoliciesModule } from './policies/policies.module';
import { LicensesModule } from './licenses/licenses.module';
import { JobsModule } from './jobs/jobs.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProvidersModule } from './providers/providers.module';
import { RbacModule } from './rbac/rbac.module';
import { TeamsModule } from './teams/teams.module';
import { UsageModule } from './usage/usage.module';
import { UsersModule } from './users/users.module';
import { OrgThrottlerGuard } from './common/guards/org-throttler.guard';
import { TelemetryModule } from './telemetry/telemetry.module';
import { RequestIdMiddleware } from './telemetry/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL_MS ?? 60_000),
        limit: Number(process.env.THROTTLE_LIMIT ?? 120),
      },
    ]),
    TelemetryModule,
    EditionsModule,
    PrismaModule,
    CacheModule,
    AuthModule,
    ComplianceModule,
    CostCentersModule,
    HealthModule,
    OrganizationsModule,
    UsersModule,
    TeamsModule,
    AnalyticsModule,
    DashboardModule,
    EventsModule,
    GatewayModule,
    InsightsModule,
    InstanceSettingsModule,
    IntegrationsModule,
    PoliciesModule,
    AgentsModule,
    LicensesModule,
    RbacModule,
    BudgetsModule,
    AlertsModule,
    AuditModule,
    JobsModule,
    ProvidersModule,
    UsageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: OrgThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
