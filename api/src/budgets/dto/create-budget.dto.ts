import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { BudgetScope } from '@prisma/client';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsEnum(BudgetScope)
  scope!: BudgetScope;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @IsNumber()
  @Min(1)
  monthlyLimit!: number;
}
