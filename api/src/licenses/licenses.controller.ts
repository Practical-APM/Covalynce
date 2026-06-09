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
import { CreateLicenseDto, UpdateLicenseDto } from './dto/create-license.dto';
import { LicensesService } from './licenses.service';

@ApiTags('licenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('api/v1/licenses')
export class LicensesController {
  constructor(private readonly licenses: LicensesService) {}

  @Get()
  @RequirePermission('licenses:read')
  list(@CurrentUser() user: AuthUser) {
    return this.licenses.list(user.organizationId);
  }

  @Get('summary')
  @RequirePermission('licenses:read')
  summary(@CurrentUser() user: AuthUser) {
    return this.licenses.summary(user.organizationId);
  }

  @Post()
  @RequirePermission('licenses:manage')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLicenseDto) {
    return this.licenses.create(user.organizationId, user, dto);
  }

  @Patch(':id')
  @RequirePermission('licenses:manage')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateLicenseDto,
  ) {
    return this.licenses.update(id, user.organizationId, user, dto);
  }

  @Delete(':id')
  @RequirePermission('licenses:manage')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.licenses.remove(id, user.organizationId, user);
  }
}
