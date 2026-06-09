import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(64)
  slug!: string;

  @IsString()
  @IsNotEmpty()
  adminEmail!: string;

  @IsString()
  @MaxLength(120)
  adminName?: string;
}
