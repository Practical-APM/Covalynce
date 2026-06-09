import { IsOptional, IsString, IsUUID } from 'class-validator';
import { CursorQueryDto } from '../../common/dto/cursor-query.dto';

export class UsageQueryDto extends CursorQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  model?: string;
}
