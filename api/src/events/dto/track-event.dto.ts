import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class TrackEventDto {
  @IsString()
  @MaxLength(80)
  event!: string;

  @IsObject()
  @IsOptional()
  properties?: Record<string, unknown>;
}
