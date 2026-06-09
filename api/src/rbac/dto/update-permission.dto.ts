import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdatePermissionDto {
  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  permission!: string;

  @IsBoolean()
  allowed!: boolean;
}
