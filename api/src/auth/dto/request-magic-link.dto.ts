import { IsEmail, IsString, MinLength } from 'class-validator';

export class RequestMagicLinkDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  organizationSlug!: string;
}
