import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateAlertSettingsDto {
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsString()
  @IsOptional()
  slackWebhook?: string;

  @IsInt()
  @Min(50)
  @Max(100)
  @IsOptional()
  budgetThresholdPercent?: number;
}
