import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { StatusArtists } from 'src/modules/artist/enum';

export class GetListArtistDto {
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
  @IsIn([
    StatusArtists.DEFAULT,
    StatusArtists.APPROVED,
    StatusArtists.DISAPPROVED,
    StatusArtists.PENDING,
  ])
  status: Number;
}
