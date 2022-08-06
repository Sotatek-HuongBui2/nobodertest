import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveAdminDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  address: string;
}
