import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGatewayKeyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;
}
