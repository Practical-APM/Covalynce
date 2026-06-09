import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { SsoProvider } from '@prisma/client';

export class UpdateSsoConfigDto {
  @IsEnum(SsoProvider)
  @IsOptional()
  provider?: SsoProvider;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsString()
  @IsOptional()
  issuerUrl?: string;

  @IsUrl()
  @IsOptional()
  jwksUri?: string;

  @IsString()
  @IsOptional()
  audience?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedEmailDomains?: string[];
}

export class SsoExchangeDto {
  @IsString()
  organizationSlug!: string;

  @IsString()
  accessToken!: string;
}
