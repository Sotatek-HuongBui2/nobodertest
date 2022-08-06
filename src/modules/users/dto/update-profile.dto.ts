import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { IsEmailCustom } from 'src/common/decorators/is-email.decorator';

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(1, 32)
  userName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  website: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  discordSite: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  twitterSite: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  youtubeSite: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  instagramSite: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsEmailCustom()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  zoomMail: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;
}
