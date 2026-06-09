import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

@ApiTags('teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @RequirePermission('members:read')
  list(@CurrentUser() user: AuthUser) {
    return this.teamsService.listByOrganization(user.organizationId);
  }

  @Get(':id')
  @RequirePermission('members:read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.teamsService.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePermission('members:manage')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(user.organizationId, user, dto);
  }

  @Patch(':id')
  @RequirePermission('members:manage')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, user.organizationId, user, dto);
  }

  @Delete(':id')
  @RequirePermission('members:manage')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.teamsService.remove(id, user.organizationId, user);
  }
}
