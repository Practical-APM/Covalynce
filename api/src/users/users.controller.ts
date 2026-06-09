import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.getMe(user.userId);
  }

  @Get()
  @RequirePermission('members:read')
  list(@CurrentUser() user: AuthUser) {
    return this.usersService.listByOrganization(user.organizationId);
  }

  @Get(':id')
  @RequirePermission('members:read')
  getProfile(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Query('range') range?: string,
  ) {
    return this.usersService.getProfile(id, user.organizationId, range);
  }

  @Patch(':id')
  @RequirePermission('members:manage')
  updateRole(
    @Param('id') id: string,
    @CurrentUser() actor: AuthUser,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole(id, actor.organizationId, actor, dto);
  }

  @Delete(':id')
  @RequirePermission('members:manage')
  remove(@Param('id') id: string, @CurrentUser() actor: AuthUser) {
    return this.usersService.remove(id, actor.organizationId, actor);
  }
}
