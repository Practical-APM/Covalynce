import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PolicyRuleType, PolicyScope, BudgetEnforcement } from '@prisma/client';

export class CreatePolicyRuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsEnum(PolicyRuleType)
  type!: PolicyRuleType;

  @IsEnum(PolicyScope)
  @IsOptional()
  scope?: PolicyScope;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  /** e.g. { models: ["gpt-4o-mini"] } or { thresholdPercent: 100 } */
  config!: Record<string, unknown>;
}

export class UpdatePolicyRuleDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsOptional()
  config?: Record<string, unknown>;
}

export class UpdateEnforcementDto {
  @IsEnum(BudgetEnforcement)
  budgetEnforcement!: BudgetEnforcement;
}
