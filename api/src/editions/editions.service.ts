import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  EnterpriseFeature,
  ENTERPRISE_FEATURE_LABELS,
  ENTERPRISE_FEATURES,
} from './editions.constants';

export type ProductEdition = 'community' | 'enterprise';

@Injectable()
export class EditionsService implements OnModuleInit {
  private readonly deploymentEdition: ProductEdition;
  private readonly licensed: boolean;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    const raw = (config.get<string>('COVALYNCE_EDITION') ?? 'community')
      .toLowerCase()
      .trim();
    this.deploymentEdition = raw === 'enterprise' ? 'enterprise' : 'community';
    this.licensed = Boolean(
      config.get<string>('COVALYNCE_LICENSE_KEY')?.trim(),
    );
  }

  onModuleInit() {
    if (this.deploymentEdition === 'community' && !this.licensed) {
      console.warn(
        '[Editions] COVALYNCE_EDITION=community — SSO, compliance export, multi-org, and RBAC overrides require Enterprise plan or COVALYNCE_LICENSE_KEY.',
      );
    }
  }

  normalizePlan(plan: string | null | undefined): ProductEdition {
    const p = (plan ?? 'community').toLowerCase().trim();
    if (p === 'community' || p === 'free') return 'community';
    return 'enterprise';
  }

  /** Deployment-level mode (self-host bundle) */
  getDeploymentEdition(): ProductEdition {
    if (this.licensed) return 'enterprise';
    return this.deploymentEdition;
  }

  async getOrganizationEdition(
    organizationId: string,
  ): Promise<ProductEdition> {
    if (this.licensed) return 'enterprise';

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });
    if (!org) return 'community';
    return this.normalizePlan(org.plan);
  }

  async canUseEnterpriseFeature(
    organizationId: string,
    feature: EnterpriseFeature,
  ): Promise<boolean> {
    if (!ENTERPRISE_FEATURES.includes(feature)) return false;
    const edition = await this.getOrganizationEdition(organizationId);
    return edition === 'enterprise';
  }

  async assertEnterpriseFeature(
    organizationId: string,
    feature: EnterpriseFeature,
  ): Promise<void> {
    const allowed = await this.canUseEnterpriseFeature(organizationId, feature);
    if (allowed) return;

    const label = ENTERPRISE_FEATURE_LABELS[feature];
    throw new ForbiddenException(
      `${label} is available on Enterprise Edition. Upgrade this organization's plan or set COVALYNCE_LICENSE_KEY for licensed self-host.`,
    );
  }

  async featureFlagsForOrganization(organizationId: string) {
    const edition = await this.getOrganizationEdition(organizationId);
    const enterprise = edition === 'enterprise';
    return {
      edition,
      deploymentEdition: this.getDeploymentEdition(),
      licensed: this.licensed,
      features: Object.fromEntries(
        ENTERPRISE_FEATURES.map((f) => [f, enterprise]),
      ) as Record<EnterpriseFeature, boolean>,
    };
  }
}
