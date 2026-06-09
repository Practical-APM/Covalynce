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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto } from './dto/create-agent.dto';

@ApiTags('agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/agents')
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Get()
  @RequirePermission('agents:read')
  list(@CurrentUser() user: AuthUser) {
    return this.agents.list(user.organizationId);
  }

  @Post()
  @RequirePermission('agents:manage')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAgentDto) {
    return this.agents.create(user.organizationId, user, dto);
  }

  @Patch(':id')
  @RequirePermission('agents:manage')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateAgentDto,
  ) {
    return this.agents.update(id, user.organizationId, user, dto);
  }

  @Delete(':id')
  @RequirePermission('agents:manage')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.agents.remove(id, user.organizationId, user);
  }
}
