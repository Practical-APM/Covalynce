import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { InviteUserDto } from '../users/dto/invite-user.dto';
import { UsersService } from '../users/users.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@Controller('api/v1/organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
  ) {}

  /** Public signup — returns JWT for admin */
  @Post()
  @SkipThrottle()
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    if (id !== user.organizationId) {
      throw new ForbiddenException('Cannot access another organization');
    }
    return this.organizationsService.findById(id);
  }

  @Post(':id/invites')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @RequirePermission('members:manage')
  invite(
    @Param('id') orgId: string,
    @CurrentUser() actor: AuthUser,
    @Body() dto: InviteUserDto,
  ) {
    if (orgId !== actor.organizationId) {
      throw new ForbiddenException('Cannot invite to another organization');
    }
    return this.usersService.invite(orgId, actor, dto);
  }
}
