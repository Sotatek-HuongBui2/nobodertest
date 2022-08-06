import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusArtists } from 'src/modules/artist/enum';

export class ChangeStatusArtistDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @IsIn([
    StatusArtists.DEFAULT,
    StatusArtists.APPROVED,
    StatusArtists.DISAPPROVED,
    StatusArtists.PENDING,
  ])
  status: number;
}
