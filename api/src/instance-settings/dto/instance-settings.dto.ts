import { IsEmail, IsObject, IsOptional } from 'class-validator';

export class UpdateInstanceSettingsDto {
  @IsObject()
  values!: Record<string, string | null>;
}

export class TestEmailDto {
  @IsEmail()
  @IsOptional()
  to?: string;
}
