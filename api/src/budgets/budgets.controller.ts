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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/budgets')
export class BudgetsController {
  constructor(private readonly budgets: BudgetsService) {}

  @Get()
  @RequirePermission('budgets:read')
  list(@CurrentUser() user: AuthUser) {
    return this.budgets.listWithSpend(user.organizationId);
  }

  @Get('burn-rate')
  @RequirePermission('budgets:read')
  burnRate(@CurrentUser() user: AuthUser) {
    return this.budgets.getOrgBurnRate(user.organizationId);
  }

  @Post()
  @RequirePermission('budgets:manage')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBudgetDto) {
    return this.budgets.create(user.organizationId, user, dto);
  }

  @Patch(':id')
  @RequirePermission('budgets:manage')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgets.update(id, user.organizationId, user, dto);
  }

  @Delete(':id')
  @RequirePermission('budgets:manage')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.budgets.remove(id, user.organizationId, user);
  }
}
