import { IsBoolean, IsObject, IsOptional } from 'class-validator';
import { ProviderName } from '@prisma/client';

export class UpdateRoutingSettingsDto {
  @IsBoolean()
  @IsOptional()
  intelligentRouting?: boolean;

  @IsObject()
  @IsOptional()
  customMappings?: Record<string, { provider: ProviderName; model: string }>;
}
