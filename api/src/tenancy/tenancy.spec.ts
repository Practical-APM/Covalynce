import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { TeamsService } from '../teams/teams.service';

describe('Tenancy isolation', () => {
  const orgA = 'org-a-uuid';
  const orgB = 'org-b-uuid';

  const userA: AuthUser = {
    userId: 'user-a',
    organizationId: orgA,
    email: 'a@acme.com',
    role: UserRole.ADMIN,
  };

  const mockPrisma = {
    team: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
  };

  let service: TeamsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TeamsService(mockPrisma as never);
  });

  it('rejects cross-org access via assertOrgAccess', () => {
    expect(() => service.assertOrgAccess(orgB, userA)).toThrow(
      ForbiddenException,
    );
  });

  it('findOne scopes query to organization', async () => {
    mockPrisma.team.findFirst.mockResolvedValue(null);
    await expect(service.findOne('team-1', orgB)).rejects.toThrow();
    expect(mockPrisma.team.findFirst).toHaveBeenCalledWith({
      where: { id: 'team-1', organizationId: orgB },
      include: {
        members: { include: { user: true } },
        _count: { select: { usageEvents: true } },
      },
    });
  });
});
