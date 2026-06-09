import { IsString, MinLength } from 'class-validator';

export class SwitchOrganizationDto {
  @IsString()
  @MinLength(2)
  organizationSlug!: string;
}
