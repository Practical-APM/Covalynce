import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ImportPoliciesYamlDto {
  @IsString()
  @IsNotEmpty()
  yaml!: string;

  @IsEnum(['append', 'replace'])
  @IsOptional()
  mode?: 'append' | 'replace';
}
