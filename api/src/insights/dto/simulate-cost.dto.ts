import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ModelSwapDto {
  @IsString()
  fromModel!: string;

  @IsString()
  toModel!: string;
}

export class SimulateCostDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ModelSwapDto)
  swaps!: ModelSwapDto[];

  /** Optional % change in request volume (e.g. -20 = 20% fewer requests) */
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(200)
  volumeChangePercent?: number;
}
