import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateBudgetDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  monthlyLimit?: number;
}
