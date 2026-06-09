import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BudgetEnforcement,
  PolicyRuleType,
  PolicyScope,
  Prisma,
} from '@prisma/client';
import { parse, stringify } from 'yaml';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePolicyRuleDto } from './dto/create-policy-rule.dto';
import { UpdatePolicyRuleDto } from './dto/create-policy-rule.dto';

type YamlPolicyDoc = {
  version?: number;
  enforcement?: BudgetEnforcement;
  rules?: Array<{
    name: string;
    type: PolicyRuleType;
    scope?: PolicyScope;
    team?: string;
    teamId?: string;
    enabled?: boolean;
    config: Record<string, unknown>;
  }>;
};

@Injectable()
export class PoliciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(organizationId: string) {
    return this.prisma.policyRule.findMany({
      where: { organizationId },
      include: { team: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportYaml(organizationId: string) {
    const [rules, org] = await Promise.all([
      this.list(organizationId),
      this.prisma.organization.findUnique({
        where: { id: organizationId },
        select: { budgetEnforcement: true },
      }),
    ]);

    const doc: YamlPolicyDoc = {
      version: 1,
      enforcement: org?.budgetEnforcement ?? BudgetEnforcement.MONITORING,
      rules: rules.map((r) => ({
        name: r.name,
        type: r.type,
        scope: r.scope,
        ...(r.team ? { team: r.team.name } : {}),
        enabled: r.enabled,
        config: r.config as Record<string, unknown>,
      })),
    };

    return {
      yaml: stringify(doc, { lineWidth: 0 }),
      ruleCount: rules.length,
    };
  }

  async importYaml(
    organizationId: string,
    actor: AuthUser,
    yamlContent: string,
    mode: 'append' | 'replace' = 'append',
  ) {
    let doc: YamlPolicyDoc;
    try {
      doc = parse(yamlContent) as YamlPolicyDoc;
    } catch {
      throw new BadRequestException('Invalid YAML syntax');
    }

    if (!doc || typeof doc !== 'object') {
      throw new BadRequestException('YAML must be a policy document object');
    }

    if (doc.version !== undefined && doc.version !== 1) {
      throw new BadRequestException(
        `Unsupported policy document version: ${doc.version}`,
      );
    }

    if (!Array.isArray(doc.rules) || doc.rules.length === 0) {
      throw new BadRequestException(
        'YAML must include a non-empty rules array',
      );
    }

    if (doc.enforcement) {
      if (!Object.values(BudgetEnforcement).includes(doc.enforcement)) {
        throw new BadRequestException('Invalid enforcement mode in YAML');
      }
      await this.setEnforcement(organizationId, actor, doc.enforcement);
    }

    if (mode === 'replace') {
      await this.prisma.policyRule.deleteMany({ where: { organizationId } });
    }

    const teams = await this.prisma.team.findMany({
      where: { organizationId },
      select: { id: true, name: true },
    });
    const teamByName = new Map(teams.map((t) => [t.name.toLowerCase(), t.id]));

    const created = [];
    const errors: string[] = [];

    for (const [index, rule] of doc.rules.entries()) {
      try {
        if (!rule.name || !rule.type) {
          throw new BadRequestException('Each rule requires name and type');
        }
        if (!Object.values(PolicyRuleType).includes(rule.type)) {
          throw new BadRequestException(`Unknown rule type: ${rule.type}`);
        }

        const scope = rule.scope ?? PolicyScope.ORGANIZATION;
        let teamId: string | undefined;

        if (scope === PolicyScope.TEAM) {
          if (rule.teamId) {
            teamId = rule.teamId;
          } else if (rule.team) {
            teamId = teamByName.get(rule.team.toLowerCase());
            if (!teamId) {
              throw new BadRequestException(`Team not found: ${rule.team}`);
            }
          } else {
            throw new BadRequestException(
              `Rule "${rule.name}" is team-scoped but missing team or teamId`,
            );
          }
        }

        const dto: CreatePolicyRuleDto = {
          name: rule.name,
          type: rule.type,
          scope,
          teamId,
          enabled: rule.enabled ?? true,
          config: rule.config ?? {},
        };

        const record = await this.create(organizationId, actor, dto);
        created.push(record);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        errors.push(`Rule ${index + 1} (${rule.name ?? 'unnamed'}): ${msg}`);
      }
    }

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'policy.imported_yaml',
      resource: 'policy_rule',
      metadata: {
        mode,
        created: created.length,
        errors: errors.length,
      },
    });

    return {
      imported: created.length,
      mode,
      rules: created,
      errors,
    };
  }

  async create(
    organizationId: string,
    actor: AuthUser,
    dto: CreatePolicyRuleDto,
  ) {
    if (dto.scope === PolicyScope.TEAM && !dto.teamId) {
      throw new BadRequestException('teamId required for team-scoped policies');
    }

    const rule = await this.prisma.policyRule.create({
      data: {
        organizationId,
        name: dto.name,
        type: dto.type,
        scope: dto.scope ?? PolicyScope.ORGANIZATION,
        teamId: dto.scope === PolicyScope.TEAM ? dto.teamId : null,
        enabled: dto.enabled ?? true,
        config: dto.config as Prisma.InputJsonValue,
      },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'policy.created',
      resource: 'policy_rule',
      resourceId: rule.id,
      metadata: { type: dto.type, name: dto.name },
    });

    return rule;
  }

  async update(
    id: string,
    organizationId: string,
    actor: AuthUser,
    dto: UpdatePolicyRuleDto,
  ) {
    const existing = await this.prisma.policyRule.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new NotFoundException('Policy not found');

    const rule = await this.prisma.policyRule.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.enabled !== undefined ? { enabled: dto.enabled } : {}),
        ...(dto.config ? { config: dto.config as Prisma.InputJsonValue } : {}),
      },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'policy.updated',
      resource: 'policy_rule',
      resourceId: id,
    });

    return rule;
  }

  async remove(id: string, organizationId: string, actor: AuthUser) {
    const existing = await this.prisma.policyRule.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new NotFoundException('Policy not found');

    await this.prisma.policyRule.delete({ where: { id } });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'policy.deleted',
      resource: 'policy_rule',
      resourceId: id,
    });

    return { deleted: true };
  }

  getEnforcement(organizationId: string) {
    return this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { budgetEnforcement: true },
    });
  }

  async setEnforcement(
    organizationId: string,
    actor: AuthUser,
    mode: BudgetEnforcement,
  ) {
    const org = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { budgetEnforcement: mode },
      select: { id: true, budgetEnforcement: true },
    });

    await this.audit.log(organizationId, {
      actorUserId: actor.userId,
      action: 'policy.enforcement_updated',
      resource: 'organization',
      resourceId: organizationId,
      metadata: { budgetEnforcement: mode },
    });

    return org;
  }
}
