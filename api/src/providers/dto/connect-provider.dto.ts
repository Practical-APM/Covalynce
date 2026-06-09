import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProviderName } from '@prisma/client';

export class OAuthCallbackDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;
}

export class OAuthStartQueryDto {
  @IsOptional()
  @IsString()
  origin?: string;
}

export class ConnectProviderDto {
  @IsEnum(ProviderName)
  name!: ProviderName;

  /** Fallback when OAuth is unavailable or user chooses advanced connect */
  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  externalOrganizationId?: string;
}
