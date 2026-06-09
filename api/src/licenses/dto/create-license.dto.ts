import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLicenseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  vendor!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  planName!: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  seats?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyCost?: number;

  @IsDateString()
  @IsOptional()
  renewsAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateLicenseDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  vendor?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  planName?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  seats?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyCost?: number | null;

  @IsDateString()
  @IsOptional()
  renewsAt?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string | null;
}
