import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateImageDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  banner: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar: string;
}
