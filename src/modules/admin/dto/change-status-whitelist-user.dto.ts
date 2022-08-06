import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, isNumber, IsOptional, IsString } from 'class-validator';
import { statusWhitelistUser } from 'src/modules/whitelist-user/enum';

export class ChangeStatusWhitelistUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  networkId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @IsIn([statusWhitelistUser.DEFAULT, statusWhitelistUser.APPROVED, statusWhitelistUser.DISAPPROVED, statusWhitelistUser.PENDING])
  status: number;
}
