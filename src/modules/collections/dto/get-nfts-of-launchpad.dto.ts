import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetNftsOfLaunchpadDto {
  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number;

  @ApiProperty({ default: 5, required: false })
  @IsOptional()
  @Min(1)
  @Max(100)
  @IsNumber()
  @Type(() => Number)
  limit: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  launchpadId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId: number;
}
