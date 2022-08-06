import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class RequestArtistDto {
    @ApiProperty({ required: true })
    @IsString()
    firstAnswer: string;

    @ApiProperty({ required: true })
    @IsString()
    secondAnswer: string;
}
