import { IsInt, Max, Min } from 'class-validator';

export class UpdateGatewayKeyDto {
  @IsInt()
  @Min(10)
  @Max(10_000)
  rateLimitRpm!: number;
}
