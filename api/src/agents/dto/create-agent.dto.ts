import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyBudget?: number;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class UpdateAgentDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsUUID()
  @IsOptional()
  teamId?: string | null;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyBudget?: number | null;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
