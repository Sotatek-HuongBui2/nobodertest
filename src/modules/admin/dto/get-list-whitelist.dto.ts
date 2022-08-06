import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { statusWhitelistUser } from 'src/modules/whitelist-user/enum';

export class GetListWhitelistDto {

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;

  @ApiProperty({ default: 3, required: false })
  @IsOptional()
  @Min(1)
  @Max(100)
  @IsNumber()
  @Type(() => Number)
  limit: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsIn([statusWhitelistUser.DEFAULT, statusWhitelistUser.APPROVED, statusWhitelistUser.DISAPPROVED, statusWhitelistUser.PENDING])
  status: Number;
}
