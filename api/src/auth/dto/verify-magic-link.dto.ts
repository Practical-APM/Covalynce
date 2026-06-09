import { IsString, MinLength } from 'class-validator';

export class VerifyMagicLinkDto {
  @IsString()
  @MinLength(16)
  token!: string;
}
