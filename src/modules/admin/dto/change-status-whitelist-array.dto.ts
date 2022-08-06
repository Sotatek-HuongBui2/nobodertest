import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, isNumber, IsOptional, IsString } from 'class-validator';
import { statusWhitelistUser } from 'src/modules/whitelist-user/enum';

export class ChangeStatusWhitelistArrayDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  ids: number[];
}
